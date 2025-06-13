Setup: https://developers.cloudflare.com/email-routing/email-workers/

Since this code relies heavily on plus-addressing **which is [not automatically supported by Cloudflare Workers Email Routes](https://community.cloudflare.com/t/support-plus-addressing-in-email-routing/346812/39)** you will need to bind this worker to a [domain-wide catch-all address](https://developers.cloudflare.com/email-routing/setup/email-routing-addresses/#catch-all-address). So you probably don't want to set this up against your primary domain! Better to use a dedicated domain for this (sadly they don't support [subdomain-based catch-alls either](https://developers.cloudflare.com/email-routing/setup/email-routing-addresses/#catch-all-address)) 

Deploy: `npx wrangler deploy`

You'll want to change the `FORWARD_TO_EMAIL` and `ACTIONKIT_DOMAIN_NAME` 
configuration in `wrangler.jsonc` too! Note that your `FORWARD_TO_EMAIL` 
will need to be [verified as a destination address](https://developers.cloudflare.com/email-routing/setup/email-routing-addresses/#destination-addresses) in your Cloudflare account.


