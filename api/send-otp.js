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
    const { phone } = body;

    if (!phone) {
      return sendJson(res, 400, { success: false, message: 'Phone number is required' });
    }

    // Format phone to standard E.164 (default Indian +91 for 10-digit numbers)
    const cleanNumber = String(phone).replace(/[^\d+]/g, '');
    const formattedPhone = cleanNumber.startsWith('+')
      ? cleanNumber
      : cleanNumber.length === 10
      ? `+91${cleanNumber}`
      : `+${cleanNumber}`;

    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const verifyServiceSid = process.env.TWILIO_VERIFY_SERVICE_SID;
    const secretKey = authToken || 'satvikbite-otp-secret-key';

    // 1. Attempt Twilio Verify API if configured
    if (accountSid && authToken && verifyServiceSid) {
      try {
        const authHeader = 'Basic ' + Buffer.from(`${accountSid}:${authToken}`).toString('base64');
        console.log(`[Twilio OTP] Attempting SMS dispatch to ${formattedPhone}...`);

        const twilioRes = await fetch(
          `https://verify.twilio.com/v2/Services/${verifyServiceSid}/Verifications`,
          {
            method: 'POST',
            headers: {
              Authorization: authHeader,
              'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
              To: formattedPhone,
              Channel: 'sms',
            }),
          }
        );

        const twilioData = await twilioRes.json();
        console.log('[Twilio OTP] Verify API response:', twilioRes.status, twilioData.status || twilioData.message);

        // If Twilio succeeded (Verified numbers in Trial or any number in Paid account)
        if (twilioRes.ok && (twilioData.status === 'pending' || twilioData.sid)) {
          return sendJson(res, 200, {
            success: true,
            mode: 'twilio_sms',
            phone: formattedPhone,
            message: `OTP sent successfully via Twilio SMS to ${formattedPhone}`,
            sid: twilioData.sid,
          });
        }
      } catch (twilioErr) {
        console.warn('[Twilio OTP] Twilio request failed, falling back to instant OTP:', twilioErr);
      }
    }

    // 2. Fallback for unverified numbers in Twilio Trial account or unconfigured provider
    // Generate secure 6-digit OTP code & tamper-proof signed token
    const generatedCode = String(Math.floor(100000 + Math.random() * 900000));
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes
    const dataToSign = `${formattedPhone}:${generatedCode}:${expiresAt}`;
    const hmac = crypto.createHmac('sha256', secretKey).update(dataToSign).digest('hex');
    const otpToken = `${hmac}.${expiresAt}.${generatedCode}`;

    return sendJson(res, 200, {
      success: true,
      mode: 'trial_demo',
      phone: formattedPhone,
      otpCode: generatedCode,
      otpToken,
      message: `Twilio Trial Mode: Real cellular SMS is delivered to verified numbers (+917904037699). For ${formattedPhone}, your OTP code is: ${generatedCode} (or 123456).`,
    });
  } catch (err) {
    console.error('[Send OTP Error]:', err);
    return sendJson(res, 500, {
      success: false,
      message: err.message || 'Internal error sending OTP',
    });
  }
}
