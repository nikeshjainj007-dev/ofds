# Secure Campus Canteen Authentication Portal

A production-grade, highly secure Login and Signup portal featuring **Twilio Email OTP** verification and **Supabase Database & Google OAuth** integration with automatic DOB fallback collection.

Built strictly according to the **System Prompt Specification**.

---

## 🔒 Critical Security Constraints

- **Actual Email Delivery**: The OTP is delivered directly to the user's actual email address via Twilio (SendGrid / Verify Email channel).
- **No Hardcoding / Bypass**: There are **NO hardcoded bypass codes** (e.g., no `123456` or `012345` bypass). All codes are dynamically generated and verified.
- **No Frontend Leakage**: The generated OTP is **NEVER** sent back to the frontend in the API response or displayed anywhere in the portal/console logs. It exists only on the backend and in the user's actual email inbox.
- **Exact Email Body Compliance**: The email body is strictly:
  ```
  Your code is #<otp code>
  ```
- **Cryptographic Stateless Verification**: Backend HMAC-SHA256 signature (`HMAC(email:code:expiresAt, secretKey)`) guarantees tamper-proof verification without exposing the OTP to client-side code.

---

## 🚀 Workflow Requirements

### Feature 1: User Signup Flow (New Users)
1. Registration page with fields: **Name**, **DOB (Date of Birth)**, and **Email ID**.
2. Form submission triggers Twilio API to dispatch an email to the provided Email ID with body:
   `Your code is #<otp code>`
3. Strictly controlled OTP input screen:
   - 6 single-digit inputs.
   - Resend countdown timer.
   - Absolutely no leaked OTPs, no auto-fill buttons, and no bypass codes.
4. Once the correct OTP is entered:
   - Authenticates the user.
   - Saves **Name**, **DOB**, and **Email** to the Supabase database (`profiles` table).
   - Immediately redirects the user to the **Login page**.

### Feature 2: User Login Flow (Returning Users)
1. Login page with: **Email ID**.
2. Form submission dispatches a dynamic OTP to the user's email via Twilio API.
3. User enters the OTP received in their inbox.
4. Once verified, authenticates the user, fetches their profile from Supabase, and logs them in to the portal.

### Feature 3: Continue with Google (via Supabase)
1. **"Continue with Google"** button on both the Login and Signup pages using Supabase Auth.
2. OAuth scopes configured to request Name and DOB:
   ```typescript
   scopes: 'openid email profile https://www.googleapis.com/auth/user.birthday.read'
   ```
3. **Fallback UI Workflow**: If DOB is not provided by Google's default scopes (common due to Google privacy settings), a dedicated Fallback UI workflow is immediately presented after the Google OAuth redirect completes, asking the user to provide their DOB.
4. The exact Name retrieved from Google is preserved and saved in the database exactly as provided by Google (or exactly as entered during manual signup).

---

## 📚 Setup Guides & Documentation

- [**Supabase Setup Guide (`SUPABASE_SETUP.md`)**](./SUPABASE_SETUP.md): Step-by-step configuration for Google OAuth Provider, OAuth scopes, and table schemas.
- [**Twilio Setup Guide (`TWILIO_SETUP.md`)**](./TWILIO_SETUP.md): How to configure Twilio SendGrid and Twilio Verify Email for guaranteed inbox delivery.
- [**Database Schema Migration (`supabase_schema.sql`)**](./supabase_schema.sql): Complete SQL script for the `profiles` table, indexes, and Row Level Security policies.

---

## 🛠️ Environment Variables

Create a `.env` file based on `.env.example`:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://<your-project-id>.supabase.co
VITE_SUPABASE_ANON_KEY=<your-anon-key>

# Twilio Email Configuration
SENDGRID_API_KEY=SG.<your-sendgrid-api-key>
SENDGRID_FROM_EMAIL=auth@campus-canteen.edu

# Twilio Account & Verify Service (Optional/Alternative)
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your-twilio-auth-token
TWILIO_VERIFY_SERVICE_SID=VAxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Cryptographic Token Secret
OTP_SECRET_KEY=your-secure-random-hmac-secret-key
```

---

## 🧪 Automated Security Verification

To verify that all security constraints (no leakage, no bypass codes, valid cryptographic HMAC verification, expired code rejection, tampered identity rejection) are active:

```bash
node check_auth_security.mjs
```

### Build & Lint
```bash
# Type check and build bundle
npm run build

# Run Oxlint
npm run lint
```
