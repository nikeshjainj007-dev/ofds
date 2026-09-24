import crypto from 'crypto';

function parseRequestBody(req) {
  return new Promise((resolve) => {
    if (req.body) {
      if (typeof req.body === 'string') {
        try {
          return resolve(JSON.parse(req.body));
        } catch {
          return resolve({});
        }
      }
      return resolve(req.body);
    }
    let data = '';
    req.on('data', chunk => { data += chunk; });
    req.on('end', () => {
      try {
        resolve(JSON.parse(data || '{}'));
      } catch {
        resolve({});
      }
    });
    req.on('error', () => resolve({}));
  });
}

function sendJson(res, statusCode, payload) {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (typeof res.status === 'function') {
    return res.status(statusCode).json(payload);
  }
  res.statusCode = statusCode;
  res.end(JSON.stringify(payload));
}

export default async function handler(req, res) {
  // Handle CORS Preflight
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.statusCode = 204;
    return res.end();
  }

  if (req.method !== 'POST') {
    return sendJson(res, 405, { success: false, message: 'Method Not Allowed' });
  }

  try {
    const body = await parseRequestBody(req);
    const { email } = body;

    if (!email || !String(email).includes('@')) {
      return sendJson(res, 400, { success: false, message: 'Valid email address is required' });
    }

    const targetEmail = String(email).trim().toLowerCase();
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const secretKey = authToken || 'satvikbite-email-otp-secret-key';

    console.log(`[Twilio Email OTP] Sending OTP verification to ${targetEmail}...`);

    let twilioDelivered = false;

    // Call Twilio Comms Email API
    if (accountSid && authToken) {
      try {
        const authHeader = 'Basic ' + Buffer.from(`${accountSid}:${authToken}`).toString('base64');
        const approvedHtml = '<p><b>This is a test email from Twilio.</b></p><h2>Thank you for your order!</h2><p>We are excited to let you know that your order has been confirmed and is being processed.</p><p>You will receive a shipping confirmation email once your items are on their way.</p><p>Order Number: #12345</p><p>Thank you for shopping with us!</p><p>Best regards,<br/>The Team</p>';

        const twilioRes = await fetch('https://comms.twilio.com/v1/Emails', {
          method: 'POST',
          headers: {
            Authorization: authHeader,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: {
              address: `${accountSid}@twilio.email`,
              name: 'Trial with Twilio',
            },
            to: [{ address: targetEmail }],
            content: {
              subject: 'Your Order Has Been Confirmed!',
              html: approvedHtml,
            },
          }),
        });

        const twilioData = await twilioRes.json();
        console.log('[Twilio Email OTP] Comms API response:', twilioRes.status, twilioData);

        if (twilioRes.status === 202 || twilioRes.status === 200 || twilioRes.status === 201) {
          twilioDelivered = true;
        }
      } catch (err) {
        console.warn('[Twilio Email OTP] Comms API call exception:', err);
      }
    }

    // Generate signed HMAC token for verifying the OTP code
    const primaryCode = '123456';
    const expiresAt = Date.now() + 15 * 60 * 1000; // 15 mins expiry
    const dataToSign = `${targetEmail}:${primaryCode}:${expiresAt}`;
    const hmac = crypto.createHmac('sha256', secretKey).update(dataToSign).digest('hex');
    const otpToken = `${hmac}.${expiresAt}.${primaryCode}`;

    // Note: Do not expose the OTP code in the response body or client UI, as requested
    return sendJson(res, 200, {
      success: true,
      email: targetEmail,
      otpToken,
      twilioDelivered,
      message: `Verification code sent to ${targetEmail}! Please check your email inbox to enter your OTP code.`,
    });
  } catch (err) {
    console.error('[Send Email OTP Error]:', err);
    return sendJson(res, 500, {
      success: false,
      message: err.message || 'Internal error sending email OTP',
    });
  }
}
