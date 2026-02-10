# Netlify Deployment

This project includes a Netlify Function (`netlify/functions/send-email.js`) that forwards form submissions to SendGrid.

Steps to deploy on Netlify:

1. Push this repository to GitHub.
2. Create a new site on Netlify and connect the GitHub repo.
3. In Netlify Site Settings → Build & deploy → Environment, add these variables:
   - `SENDGRID_API_KEY` = your SendGrid API key
   - `TO_EMAIL` = janis.mayer92@gmail.com (or another recipient)
4. The included `netlify.toml` publishes the repository root and uses `netlify/functions` for functions.
5. After deploy, the app will call `/.netlify/functions/send-email` to send emails.

Local testing:

- Install the Netlify CLI (`npm i -g netlify-cli`) and run `netlify dev` at the project root to emulate functions locally.

Notes:
- SendGrid may require verifying a sender email or domain before it will deliver messages.
- If you prefer another provider, replace `netlify/functions/send-email.js` with your provider's API calls.
