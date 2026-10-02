# Twilio Email Setup Guide: SendGrid & Twilio Verify (Email Channel)

This guide explains how to configure Twilio for guaranteed **Email OTP delivery** as required by the System Prompt Specification.

---

## 1. Overview of Twilio Email Capabilities

While Twilio is traditionally renowned for SMS, the requirement strictly dictates **Email OTP delivery**. Twilio offers two official mechanisms to guarantee inbox delivery for transactional emails:

1. **Twilio SendGrid (Recommended & Priority)**: High-deliverability transactional email API allowing exact template and body control (`Your code is #<otp code>`).
2. **Twilio Verify (Email Channel)**: Twilio's managed verification API integrated with a SendGrid email template.

---

## 2. Option A: Twilio SendGrid API Setup (Recommended)

### Step 1: Create a SendGrid Account & API Key
1. Sign up or log in to the [Twilio SendGrid Console](https://app.sendgrid.com/).
2. In the left sidebar, navigate to **Settings** > **API Keys**.
3. Click **Create API Key**.
4. Name the key (e.g., `Campus-Auth-Service`).
5. Select **Restricted Access** > grant **Full Access** to **Mail Send**.
6. Click **Create & View**, then copy your API Key (`SG.xxxxxxxxxxxxxxxx`).

### Step 2: Sender Identity Verification
To guarantee email deliverability and avoid spam filters:
1. Navigate to **Settings** > **Sender Authentication**.
2. Complete **Single Sender Verification** (for quick setup) or **Domain Authentication** (for custom domain `yourdomain.com`).
3. Note the verified sender email address (e.g., `auth@campus-canteen.edu`).

### Step 3: Exact Email Body Compliance
The specification requires:
```
Your code is #<otp code>
```
The backend implementation in `api/send-otp.js` dispatches this exact body:
```json
{
  "personalizations": [{ "to": [{ "email": "user@example.com" }] }],
  "from": { "email": "auth@campus-canteen.edu", "name": "Campus Canteen Auth" },
  "subject": "Your Verification Code",
  "content": [
    { "type": "text/plain", "value": "Your code is #489201" },
    { "type": "text/html", "value": "<p>Your code is #489201</p>" }
  ]
}
```

---

## 3. Option B: Twilio Verify Service (Email Integration)

If using Twilio Verify with the Email channel:

### Step 1: Create a Verify Service
1. Log in to the [Twilio Console](https://console.twilio.com/).
2. Navigate to **Explore Products** > **Verify** > **Services**.
3. Click **Create Service**, name it `Campus Canteen Verify`.
4. Copy the **Service SID** (starts with `VA...`).

### Step 2: Connect SendGrid to Twilio Verify
1. In Twilio Console, go to **Verify** > **Email Integration**.
2. Click **New Integration**.
3. Enter your SendGrid API key and verified from email.
4. Link this integration to your Verify Service.

---

## 4. Environment Variables Configuration

Add the following to your `.env` or Vercel Environment Variables:

```env
# Twilio Account Credentials
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_twilio_auth_token_here

# Twilio SendGrid Configuration (Priority)
SENDGRID_API_KEY=SG.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
SENDGRID_FROM_EMAIL=auth@campus-canteen.edu

# Twilio Verify Service (Email Channel)
TWILIO_VERIFY_SERVICE_SID=VAxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Cryptographic Token Secret for Tamper-Proof Stateless OTP
OTP_SECRET_KEY=your-secure-random-hmac-secret-key
```

---

## 5. Security & Verification Flow

1. **Dynamically Generated Code**: `crypto.randomInt(100000, 1000000)` generates a fresh 6-digit random code per request.
2. **No Frontend Leakage**: The OTP code is NEVER sent in the HTTP response or logged anywhere in client console or server logs.
3. **Stateless HMAC Token**: A signature `HMAC-SHA256(email:code:expiresAt, secretKey)` is returned to the client.
4. **No Bypass Codes**: Hardcoded bypass codes (`123456`, `012345`, etc.) are completely prohibited and rejected.
5. **Single-Use Verification**: When the user enters the code received in their email, the backend recalculates the HMAC using timing-safe buffer comparison to prevent timing attacks.
