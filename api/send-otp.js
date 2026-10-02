import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://dcfzpiszpnpmhvjtfups.supabase.co';
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRjZnpwaXN6cG5wbWh2anRmdXBzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTAxNjY3NTksImV4cCI6MjEwNTc0Mjc1OX0.VUE9v_Vpc3wKYyNn8sDWuNpxUQT41zA3Yn6rOnM38xU';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

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

    // Dynamically generate a cryptographically secure 6-digit OTP code
    const otpCode = crypto.randomInt(100000, 1000000).toString();

    // Exact email body requirement: Your code is #<otp code>
    const emailBodyText = `Your code is #${otpCode}`;
    const emailBodyHtml = `<div style="font-family: sans-serif; font-size: 16px; color: #1f2937; padding: 24px; max-width: 480px; margin: 0 auto; border: 1px solid #e5e7eb; rounded: 12px;">
      <h2 style="color: #065f46; margin-top: 0;">Campus Canteen Security Verification</h2>
      <p style="font-size: 18px; font-weight: bold; margin: 24px 0; color: #111827;">Your code is #${otpCode}</p>
      <p style="font-size: 13px; color: #6b7280; margin-bottom: 0;">This code is valid for 10 minutes. If you did not request this code, please ignore this email.</p>
    </div>`;

    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const sendGridApiKey = process.env.SENDGRID_API_KEY || process.env.TWILIO_SENDGRID_API_KEY;
    const sendGridFrom = process.env.SENDGRID_FROM_EMAIL || process.env.TWILIO_EMAIL_FROM || 'auth@campus-canteen.edu';
    const verifyServiceSid = process.env.TWILIO_VERIFY_SERVICE_SID;

    const secretKey = process.env.OTP_SECRET_KEY || authToken || 'satvikbite-secure-auth-secret-hmac-key';

    let twilioDelivered = false;
    let providerUsed = 'none';

    // 1. Prioritize Twilio SendGrid API
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
        } else {
          console.warn('[Twilio SendGrid] HTTP status:', sgRes.status);
        }
      } catch (sgErr) {
        console.warn('[Twilio SendGrid] Exception:', sgErr.message);
      }
    }

    // 2. Try Twilio Verify Service (Email Channel) if configured
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

        const vData = await vRes.json();
        if (vRes.status >= 200 && vRes.status < 300) {
          twilioDelivered = true;
          providerUsed = 'twilio_verify_email';
        } else {
          console.warn('[Twilio Verify Email] Status:', vRes.status, vData.message || '');
        }
      } catch (vErr) {
        console.warn('[Twilio Verify Email] Exception:', vErr.message);
      }
    }

    // 3. Try Twilio Comms Email API
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
              address: process.env.TWILIO_EMAIL_FROM || `${accountSid}@twilio.email`,
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
      } catch (cErr) {
        console.warn('[Twilio Comms Email] Exception:', cErr.message);
      }
    }

    // 4. Supabase Email Auth fallback if Twilio trial or unconfigured
    if (!twilioDelivered && SUPABASE_URL && SUPABASE_ANON_KEY) {
      try {
        const { error: supaErr } = await supabase.auth.signInWithOtp({
          email: targetEmail,
          options: { shouldCreateUser: true },
        });
        if (!supaErr) {
          providerUsed = 'supabase_email';
        }
      } catch (sErr) {
        console.warn('[Supabase Email Fallback] Error:', sErr.message);
      }
    }

    // Generate stateless cryptographic HMAC signature of targetEmail + otpCode + expiresAt
    // CRITICAL SECURITY CONSTRAINT: otpCode is NEVER sent back in the response or token!
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes expiry
    const dataToSign = `${targetEmail}:${otpCode}:${expiresAt}`;
    const hmacSignature = crypto.createHmac('sha256', secretKey).update(dataToSign).digest('hex');
    const otpToken = `${hmacSignature}.${expiresAt}`;

    return sendJson(res, 200, {
      success: true,
      email: targetEmail,
      otpToken,
      twilioDelivered,
      providerUsed,
      message: `Verification code sent to ${targetEmail}. Please check your email inbox and Spam folder.`,
    });
  } catch (err) {
    console.error('[Send Email OTP Error]:', err);
    return sendJson(res, 500, {
      success: false,
      message: 'Internal error sending email OTP',
    });
  }
}

