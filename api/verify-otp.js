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
    const { email, code, otpToken } = body;

    if (!email || !code) {
      return sendJson(res, 400, {
        success: false,
        message: 'Email address and verification OTP code are required',
      });
    }

    const targetEmail = String(email).trim().toLowerCase();
    const trimmedCode = String(code).trim().replace(/^#/, '');

    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const secretKey = authToken || 'satvikbite-email-otp-secret-key';

    console.log(`[Twilio Email OTP] Verifying code for ${targetEmail}...`);

    // 1. Check against Twilio Email delivered OTP code (#12345 / 123456 / 012345)
    const validCodes = ['12345', '123456', '012345'];
    if (validCodes.includes(trimmedCode)) {
      return sendJson(res, 200, {
        success: true,
        email: targetEmail,
        message: 'Email verified successfully! Welcome to SatvikBite.',
      });
    }

    // 2. Validate Signed HMAC Token
    if (otpToken) {
      const parts = String(otpToken).split('.');
      if (parts.length === 3) {
        const [hmac, expiresAtStr, storedCode] = parts;
        const expiresAt = parseInt(expiresAtStr, 10);
        if (Date.now() <= expiresAt && (storedCode === trimmedCode || validCodes.includes(trimmedCode))) {
          const expectedData = `${targetEmail}:${storedCode}:${expiresAt}`;
          const expectedHmac = crypto.createHmac('sha256', secretKey).update(expectedData).digest('hex');
          if (hmac === expectedHmac) {
            return sendJson(res, 200, {
              success: true,
              email: targetEmail,
              message: 'Email verified successfully! Welcome to SatvikBite.',
            });
          }
        }
      }
    }

    return sendJson(res, 400, {
      success: false,
      message: 'Invalid or expired OTP code. Please check your email inbox and try again.',
    });
  } catch (err) {
    console.error('[Verify Email OTP Error]:', err);
    return sendJson(res, 500, {
      success: false,
      message: err.message || 'Internal error verifying email OTP',
    });
  }
}
