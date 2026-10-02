import react from '@vitejs/plugin-react';
import crypto from 'crypto';
import { defineConfig, loadEnv } from 'vite';
import type { Plugin } from 'vite';

function twilioEmailOtpPlugin(env: Record<string, string>): Plugin {
  const accountSid = env.TWILIO_ACCOUNT_SID;
  const authToken = env.TWILIO_AUTH_TOKEN;
  const sendGridApiKey = env.SENDGRID_API_KEY || env.TWILIO_SENDGRID_API_KEY;
  const sendGridFrom = env.SENDGRID_FROM_EMAIL || env.TWILIO_EMAIL_FROM || 'auth@campus-canteen.edu';
  const verifyServiceSid = env.TWILIO_VERIFY_SERVICE_SID;
  const secretKey = env.OTP_SECRET_KEY || authToken || 'satvikbite-secure-auth-secret-hmac-key';

  return {
    name: 'twilio-email-otp-plugin',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url) return next();

        // 1. Send Email OTP Endpoint
        if (req.method === 'POST' && req.url === '/api/send-otp') {
          let body = '';
          req.on('data', chunk => { body += chunk; });
          req.on('end', async () => {
            res.setHeader('Content-Type', 'application/json');
            try {
              const { email } = JSON.parse(body || '{}');
              if (!email || !String(email).includes('@')) {
                res.statusCode = 400;
                res.end(JSON.stringify({ success: false, message: 'Valid email address is required' }));
                return;
              }

              const targetEmail = String(email).trim().toLowerCase();

              // Secure dynamic 6-digit OTP generation
              const otpCode = crypto.randomInt(100000, 1000000).toString();

              // Exact email body requirement: Your code is #<otp code>
              const emailBodyText = `Your code is #${otpCode}`;
              const emailBodyHtml = `<div style="font-family: sans-serif; font-size: 16px; color: #1f2937; padding: 24px; max-width: 480px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 12px;">
                <h2 style="color: #065f46; margin-top: 0;">Campus Canteen Security Verification</h2>
                <p style="font-size: 18px; font-weight: bold; margin: 24px 0; color: #111827;">Your code is #${otpCode}</p>
                <p style="font-size: 13px; color: #6b7280; margin-bottom: 0;">This code is valid for 10 minutes. If you did not request this code, please ignore this email.</p>
              </div>`;

              let twilioDelivered = false;
              let providerUsed = 'none';

              // Prioritize Twilio SendGrid
              if (sendGridApiKey) {
                try {
                  const sgRes = await fetch('https://api.sendgrid.com/v3/mail/send', {
                    method: 'POST',
                    headers: {
                      'Authorization': `Bearer ${sendGridApiKey}`,
                      'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                      personalizations: [{ to: [{ email: targetEmail }] }],
                      from: { email: sendGridFrom, name: 'Campus Canteen Auth' },
                      subject: 'Your Verification Code',
                      content: [
                        { type: 'text/plain', value: emailBodyText },
                        { type: 'text/html', value: emailBodyHtml },
                      ],
                    }),
                  });
                  if (sgRes.status >= 200 && sgRes.status < 300) {
                    twilioDelivered = true;
                    providerUsed = 'twilio_sendgrid';
                  }
                } catch (sgErr: any) {
                  console.warn('[Twilio SendGrid Dev] Error:', sgErr.message);
                }
              }

              // Try Twilio Verify Service Email Channel
              if (!twilioDelivered && accountSid && authToken && verifyServiceSid) {
                try {
                  const authHeader = 'Basic ' + Buffer.from(`${accountSid}:${authToken}`).toString('base64');
                  const formParams = new URLSearchParams();
                  formParams.append('To', targetEmail);
                  formParams.append('Channel', 'email');

                  const vRes = await fetch(`https://verify.twilio.com/v2/Services/${verifyServiceSid}/Verifications`, {
                    method: 'POST',
                    headers: {
                      'Authorization': authHeader,
                      'Content-Type': 'application/x-www-form-urlencoded',
                    },
                    body: formParams.toString(),
                  });
                  if (vRes.status >= 200 && vRes.status < 300) {
                    twilioDelivered = true;
                    providerUsed = 'twilio_verify_email';
                  }
                } catch (vErr: any) {
                  console.warn('[Twilio Verify Email Dev] Error:', vErr.message);
                }
              }

              // Try Twilio Comms Email API
              if (!twilioDelivered && accountSid && authToken) {
                try {
                  const authHeader = 'Basic ' + Buffer.from(`${accountSid}:${authToken}`).toString('base64');
                  const commsRes = await fetch('https://comms.twilio.com/v1/Emails', {
                    method: 'POST',
                    headers: {
                      'Authorization': authHeader,
                      'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                      from: {
                        address: env.TWILIO_EMAIL_FROM || `${accountSid}@twilio.email`,
                        name: 'Campus Canteen Auth',
                      },
                      to: [{ address: targetEmail }],
                      content: {
                        subject: 'Your Verification Code',
                        text: emailBodyText,
                        html: emailBodyHtml,
                      },
                    }),
                  });
                  if (commsRes.status >= 200 && commsRes.status < 300) {
                    twilioDelivered = true;
                    providerUsed = 'twilio_comms_email';
                  }
                } catch (cErr: any) {
                  console.warn('[Twilio Comms Email Dev] Error:', cErr.message);
                }
              }

              // Stateless cryptographic HMAC token - otpCode is NEVER exposed
              const expiresAt = Date.now() + 10 * 60 * 1000;
              const dataToSign = `${targetEmail}:${otpCode}:${expiresAt}`;
              const hmacSignature = crypto.createHmac('sha256', secretKey).update(dataToSign).digest('hex');
              const otpToken = `${hmacSignature}.${expiresAt}`;

              res.statusCode = 200;
              res.end(JSON.stringify({
                success: true,
                email: targetEmail,
                otpToken,
                twilioDelivered,
                providerUsed,
                message: `Verification code sent to ${targetEmail}. Please check your email inbox and Spam folder.`,
              }));
            } catch (err: any) {
              console.error('[Twilio Email OTP Dev Error]:', err);
              res.statusCode = 500;
              res.end(JSON.stringify({
                success: false,
                message: err.message || 'Failed to send email OTP',
              }));
            }
          });
          return;
        }

        // 2. Verify Email OTP Endpoint
        if (req.method === 'POST' && req.url === '/api/verify-otp') {
          let body = '';
          req.on('data', chunk => { body += chunk; });
          req.on('end', async () => {
            res.setHeader('Content-Type', 'application/json');
            try {
              const { email, code, otpToken } = JSON.parse(body || '{}');
              if (!email || !code) {
                res.statusCode = 400;
                res.end(JSON.stringify({ success: false, message: 'Email and verification OTP code are required' }));
                return;
              }

              const targetEmail = String(email).trim().toLowerCase();
              const trimmedCode = String(code).trim().replace(/^#/, '');

              let isVerified = false;

              // Validate Signed Cryptographic HMAC Token
              if (otpToken && typeof otpToken === 'string') {
                const parts = otpToken.split('.');
                if (parts.length === 2) {
                  const [providedHmac, expiresAtStr] = parts;
                  const expiresAt = parseInt(expiresAtStr, 10);
                  if (!isNaN(expiresAt) && Date.now() <= expiresAt) {
                    const expectedData = `${targetEmail}:${trimmedCode}:${expiresAt}`;
                    const expectedHmac = crypto.createHmac('sha256', secretKey).update(expectedData).digest('hex');
                    const providedBuf = Buffer.from(providedHmac, 'hex');
                    const expectedBuf = Buffer.from(expectedHmac, 'hex');
                    if (providedBuf.length === expectedBuf.length && crypto.timingSafeEqual(providedBuf, expectedBuf)) {
                      isVerified = true;
                    }
                  }
                }
              }

              // Validate via Twilio Verify Check if configured
              if (!isVerified && accountSid && authToken && verifyServiceSid) {
                try {
                  const authHeader = 'Basic ' + Buffer.from(`${accountSid}:${authToken}`).toString('base64');
                  const formParams = new URLSearchParams();
                  formParams.append('To', targetEmail);
                  formParams.append('Code', trimmedCode);

                  const vCheckRes = await fetch(
                    `https://verify.twilio.com/v2/Services/${verifyServiceSid}/VerificationCheck`,
                    {
                      method: 'POST',
                      headers: {
                        'Authorization': authHeader,
                        'Content-Type': 'application/x-www-form-urlencoded',
                      },
                      body: formParams.toString(),
                    }
                  );
                  const vCheckData: any = await vCheckRes.json();
                  if (vCheckData.status === 'approved') {
                    isVerified = true;
                  }
                } catch (vErr: any) {
                  console.warn('[Twilio Verify Check Dev] Error:', vErr.message);
                }
              }

              if (isVerified) {
                res.statusCode = 200;
                res.end(JSON.stringify({
                  success: true,
                  email: targetEmail,
                  message: 'Email verified successfully!',
                }));
                return;
              }

              res.statusCode = 400;
              res.end(JSON.stringify({
                success: false,
                message: 'Invalid or expired verification code. Please check your inbox and try again.',
              }));
            } catch (err: any) {
              console.error('[Twilio Email OTP Dev Verification Error]:', err);
              res.statusCode = 500;
              res.end(JSON.stringify({
                success: false,
                message: err.message || 'Failed to verify email OTP code',
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
    plugins: [react(), twilioEmailOtpPlugin(env)],
    build: {
      chunkSizeWarningLimit: 800,
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules/@clerk')) {
              return 'clerk';
            }
            if (id.includes('node_modules/@supabase')) {
              return 'supabase';
            }
            if (id.includes('node_modules/lucide-react')) {
              return 'lucide';
            }
          },
        },
      },
    },
  };
});
