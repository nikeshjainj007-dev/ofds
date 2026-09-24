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
    const { phone, code, otpToken } = body;

    if (!phone || !code) {
      return sendJson(res, 400, {
        success: false,
        message: 'Phone number and 6-digit OTP code are required',
      });
    }

    const cleanNumber = String(phone).replace(/[^\d+]/g, '');
    const formattedPhone = cleanNumber.startsWith('+')
      ? cleanNumber
      : cleanNumber.length === 10
      ? `+91${cleanNumber}`
      : `+${cleanNumber}`;

    const trimmedCode = String(code).trim();

    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const verifyServiceSid = process.env.TWILIO_VERIFY_SERVICE_SID;
    const secretKey = authToken || 'satvikbite-otp-secret-key';

    // 1. Universal testing bypass code
    if (trimmedCode === '123456') {
      return sendJson(res, 200, {
        success: true,
        phone: formattedPhone,
        message: 'Verified successfully with test code (123456)! Welcome to SatvikBite.',
      });
    }

    // 2. Validate Signed HMAC Token (for unverified numbers in Twilio trial mode)
    if (otpToken) {
      const parts = String(otpToken).split('.');
      if (parts.length === 3) {
        const [hmac, expiresAtStr, storedCode] = parts;
        const expiresAt = parseInt(expiresAtStr, 10);
        if (Date.now() <= expiresAt && storedCode === trimmedCode) {
          const expectedData = `${formattedPhone}:${trimmedCode}:${expiresAt}`;
          const expectedHmac = crypto.createHmac('sha256', secretKey).update(expectedData).digest('hex');
          if (hmac === expectedHmac) {
            return sendJson(res, 200, {
              success: true,
              phone: formattedPhone,
              message: 'OTP verified successfully! Welcome to SatvikBite.',
            });
          }
        }
      }
    }

    // 3. Check with Twilio Verify Check API (for real SMS sent to verified numbers)
    if (accountSid && authToken && verifyServiceSid) {
      try {
        const authHeader = 'Basic ' + Buffer.from(`${accountSid}:${authToken}`).toString('base64');
        const twilioCheckRes = await fetch(
          `https://verify.twilio.com/v2/Services/${verifyServiceSid}/VerificationCheck`,
          {
            method: 'POST',
            headers: {
              Authorization: authHeader,
              'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
              To: formattedPhone,
              Code: trimmedCode,
            }),
          }
        );

        const checkData = await twilioCheckRes.json();
        console.log('[Twilio OTP] Verification check status:', checkData.status);

        if (checkData.status === 'approved') {
          return sendJson(res, 200, {
            success: true,
            phone: formattedPhone,
            message: 'OTP verified successfully via Twilio SMS! Welcome to SatvikBite.',
          });
        }
      } catch (checkErr) {
        console.warn('[Twilio OTP] Twilio check call warning:', checkErr);
      }
    }

    return sendJson(res, 400, {
      success: false,
      message: 'Invalid or expired OTP code. Please enter the correct 6-digit code or test code 123456.',
    });
  } catch (err) {
    console.error('[Verify OTP Error]:', err);
    return sendJson(res, 500, {
      success: false,
      message: err.message || 'Internal error verifying OTP',
    });
  }
}
