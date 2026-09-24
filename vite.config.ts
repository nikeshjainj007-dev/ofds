import react from '@vitejs/plugin-react';
import crypto from 'crypto';
import { defineConfig, loadEnv } from 'vite';
import type { Plugin } from 'vite';

function twilioOtpPlugin(env: Record<string, string>): Plugin {
  const accountSid = env.TWILIO_ACCOUNT_SID;
  const authToken = env.TWILIO_AUTH_TOKEN;
  const verifyServiceSid = env.TWILIO_VERIFY_SERVICE_SID;
  const secretKey = authToken || 'satvikbite-otp-secret-key';

  return {
    name: 'twilio-otp-plugin',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url) return next();

        // 1. Send OTP Endpoint
        if (req.method === 'POST' && req.url === '/api/send-otp') {
          let body = '';
          req.on('data', chunk => { body += chunk; });
          req.on('end', async () => {
            res.setHeader('Content-Type', 'application/json');
            try {
              const { phone } = JSON.parse(body || '{}');
              if (!phone) {
                res.statusCode = 400;
                res.end(JSON.stringify({ success: false, message: 'Phone number is required' }));
                return;
              }

              // Format to E.164 (default to +91 for 10-digit Indian numbers)
              const cleanNumber = phone.replace(/[^\d+]/g, '');
              const formattedPhone = cleanNumber.startsWith('+')
                ? cleanNumber
                : cleanNumber.length === 10
                ? `+91${cleanNumber}`
                : `+${cleanNumber}`;

              console.log(`[Twilio OTP Dev] Sending SMS verification to ${formattedPhone}...`);

              if (accountSid && authToken && verifyServiceSid) {
                try {
                  const authHeader = 'Basic ' + Buffer.from(`${accountSid}:${authToken}`).toString('base64');
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

                  const twilioData: any = await twilioRes.json();
                  console.log('[Twilio OTP Dev] Verify Response:', twilioRes.status, twilioData.status || twilioData.message);

                  if (twilioRes.ok && (twilioData.status === 'pending' || twilioData.sid)) {
                    res.statusCode = 200;
                    res.end(JSON.stringify({
                      success: true,
                      mode: 'twilio_sms',
                      phone: formattedPhone,
                      message: `OTP sent successfully via Twilio SMS to ${formattedPhone}`,
                      sid: twilioData.sid,
                    }));
                    return;
                  }
                } catch (twilioErr) {
                  console.warn('[Twilio OTP Dev] Twilio call failed:', twilioErr);
                }
              }

              // Number is unverified in Twilio trial mode, generate instant tamper-proof OTP
              const generatedCode = String(Math.floor(100000 + Math.random() * 900000));
              const expiresAt = Date.now() + 10 * 60 * 1000;
              const dataToSign = `${formattedPhone}:${generatedCode}:${expiresAt}`;
              const hmac = crypto.createHmac('sha256', secretKey).update(dataToSign).digest('hex');
              const otpToken = `${hmac}.${expiresAt}.${generatedCode}`;

              res.statusCode = 200;
              res.end(JSON.stringify({
                success: true,
                mode: 'trial_demo',
                phone: formattedPhone,
                otpCode: generatedCode,
                otpToken,
                message: `Twilio Trial Mode: Real cellular SMS is delivered to verified numbers (+917904037699). For ${formattedPhone}, your OTP code is: ${generatedCode} (or 123456).`,
              }));
            } catch (err: any) {
              console.error('[Twilio OTP Dev Error]:', err);
              res.statusCode = 500;
              res.end(JSON.stringify({
                success: false,
                message: err.message || 'Failed to send OTP via Twilio',
              }));
            }
          });
          return;
        }

        // 2. Verify OTP Endpoint
        if (req.method === 'POST' && req.url === '/api/verify-otp') {
          let body = '';
          req.on('data', chunk => { body += chunk; });
          req.on('end', async () => {
            res.setHeader('Content-Type', 'application/json');
            try {
              const { phone, code, otpToken } = JSON.parse(body || '{}');
              if (!phone || !code) {
                res.statusCode = 400;
                res.end(JSON.stringify({ success: false, message: 'Phone and 6-digit OTP code are required' }));
                return;
              }

              const cleanNumber = phone.replace(/[^\d+]/g, '');
              const formattedPhone = cleanNumber.startsWith('+')
                ? cleanNumber
                : cleanNumber.length === 10
                ? `+91${cleanNumber}`
                : `+${cleanNumber}`;

              const trimmedCode = String(code).trim();
              console.log(`[Twilio OTP Dev] Verifying code for ${formattedPhone}...`);

              // 1. Test bypass code check
              if (trimmedCode === '123456') {
                res.statusCode = 200;
                res.end(JSON.stringify({
                  success: true,
                  phone: formattedPhone,
                  message: 'Verified successfully with test code (123456)!',
                }));
                return;
              }

              // 2. Validate Signed HMAC Token (for unverified numbers in trial)
              if (otpToken) {
                const parts = String(otpToken).split('.');
                if (parts.length === 3) {
                  const [hmac, expiresAtStr, storedCode] = parts;
                  const expiresAt = parseInt(expiresAtStr, 10);
                  if (Date.now() <= expiresAt && storedCode === trimmedCode) {
                    const expectedData = `${formattedPhone}:${trimmedCode}:${expiresAt}`;
                    const expectedHmac = crypto.createHmac('sha256', secretKey).update(expectedData).digest('hex');
                    if (hmac === expectedHmac) {
                      res.statusCode = 200;
                      res.end(JSON.stringify({
                        success: true,
                        phone: formattedPhone,
                        message: 'OTP verified successfully! Welcome to SatvikBite.',
                      }));
                      return;
                    }
                  }
                }
              }

              // 3. Call Twilio Verify Check API (for real SMS numbers)
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

                  const checkData: any = await twilioCheckRes.json();
                  console.log('[Twilio OTP Dev] Verification check status:', checkData.status);

                  if (checkData.status === 'approved') {
                    res.statusCode = 200;
                    res.end(JSON.stringify({
                      success: true,
                      phone: formattedPhone,
                      message: 'OTP verified successfully via Twilio! Welcome to SatvikBite.',
                    }));
                    return;
                  }
                } catch (checkErr) {
                  console.warn('[Twilio OTP Dev] Twilio check call warning:', checkErr);
                }
              }

              res.statusCode = 400;
              res.end(JSON.stringify({
                success: false,
                message: 'Invalid or expired OTP code. Please try again or use 123456.',
              }));
            } catch (err: any) {
              console.error('[Twilio OTP Dev Verification Error]:', err);
              res.statusCode = 500;
              res.end(JSON.stringify({
                success: false,
                message: err.message || 'Failed to verify OTP code',
              }));
            }
          });
          return;
        }

        next();
      });
    },
  };
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [react(), twilioOtpPlugin(env)],
  };
});
