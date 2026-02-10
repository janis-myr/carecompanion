// Netlify Function: send-email
// Sends an email using SendGrid. Configure the following environment variables in Netlify:
// - SENDGRID_API_KEY : your SendGrid API key
// - TO_EMAIL          : destination email address (defaults to janis.mayer92@gmail.com)

exports.handler = async function (event, context) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  let payload;
  try {
    payload = JSON.parse(event.body || '{}');
  } catch (e) {
    return { statusCode: 400, body: 'Invalid JSON' };
  }

  const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
  const TO_EMAIL = process.env.TO_EMAIL || 'janis.mayer92@gmail.com';

  if (!SENDGRID_API_KEY) {
    return { statusCode: 500, body: 'SENDGRID_API_KEY not configured' };
  }

  // Build plain-text body from payload fields
  let text = '';
  if (payload.category) text += `Kategorie: ${payload.category}\n`;
  if (payload.choices) text += `Auswahl:\n${payload.choices}\n`;
  if (payload.date) text += `Datum: ${payload.date}\n`;
  // append any raw fields
  Object.keys(payload).forEach(k => {
    if (['_subject','category','choices','date'].includes(k)) return;
    text += `${k}: ${payload[k]}\n`;
  });

  const subject = payload._subject || 'Wunsch von carecompanion';

  try {
    const res = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SENDGRID_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        personalizations: [{ to: [{ email: TO_EMAIL }] , subject }],
        from: { email: payload.from || `no-reply@${event.headers.host || 'carecompanion.app'}`, name: 'CareCompanion' },
        content: [{ type: 'text/plain', value: text }]
      })
    });

    if (!res.ok) {
      const bodyText = await res.text();
      return { statusCode: 502, body: `SendGrid error: ${bodyText}` };
    }

    return { statusCode: 200, body: 'OK' };
  } catch (err) {
    return { statusCode: 502, body: 'SendGrid request failed: ' + String(err) };
  }
};
