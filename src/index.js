import PostalMime from 'postal-mime';

export default {
  async email(message, env, ctx) {
    const bcc = message.headers.get('bcc');

    if (!bcc || bcc.indexOf('+') === -1) {
      await message.forward(env.FORWARD_TO_EMAIL);
      return;
    }

    const params = new URLSearchParams(bcc.split('@')[0].split('+')[1]);
    params.set('action_email_sender', message.from);

    // If you want to let people mail in without a pregenerated AKID
    // e.g. a mailto link on a website, or in an email not sent via actionkit:
    //
    // if (!params.get('akid')) {
    //  params.set('email', message.from);
    //}

    const email = await PostalMime.parse(message.raw);
    params.set('action_email_subject', email.subject);
    params.set('action_email_body_html', email.html);
    params.set('action_email_body_text', email.text);

    // n.b. we don't want envelope to, we want headers.to -- which we get from the PostalMime-parsed object
    // rather than cloudflare's message.to because of a known issue with multi-recipient messages:
    // https://community.cloudflare.com/t/email-workers-api-message-headers-does-not-behave-as-expected/675054/3
    (email.to || []).forEach(addr => {
      const addrString = addr.name 
                        ? `${addr.name} <${addr.address}>` 
                        : addr.address;
      params.append('action_email_to', addrString);
    });
    (email.cc || []).forEach(addr => {
      const addrString = addr.name 
                        ? `${addr.name} <${addr.address}>` 
                        : addr.address;
      params.append('action_email_cc', addrString);
    });
    
    // just tossing it out there, but we could also look at the response
    // and e.g. reject or reply to sender on error, or append a custom 
    // header to the forwarded message on success that tracks the action id
    await fetch(`https://${env.ACTIONKIT_DOMAIN_NAME}/rest/v1/action/`, {
      method: 'POST',
      body: params,
    });

    await message.forward(env.FORWARD_TO_EMAIL);
  },
};
