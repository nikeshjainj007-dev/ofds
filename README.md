# Campus Canteen Secure Authentication & Ordering Portal

A production-grade, highly secure Login and Signup portal featuring **Supabase Auth** with email & password authentication, email sign-in/verification links, and **Google OAuth** integration with automatic DOB fallback collection.

---

## 🔒 Security & Workflow Features

### 1. User Login Flow (Returning Users)
- Clean Login page with fields: **Email ID** and **Enter Password** (with show/hide toggle).
- When entered email and password match, authenticates the user directly and loads their profile.
- **Account Verification & Auto-Redirect**: If the login credentials are not found (account does not exist or credentials invalid), the portal informs the user that the account does not exist and immediately redirects to the **Sign up** option with the entered email prefilled.

### 2. User Signup Flow (New Users)
- Registration page with fields:
  - **Name**
  - **DOB (Date of Birth)**
  - **Email ID**
  - **Enter New Password**
  - **Confirm Password**
- **Strong Password Enforcement**: Validates that passwords are at least 8 characters long and contain uppercase, lowercase, numbers, and special characters, along with confirmation matching.
- **Email Verification Link**: Upon submitting the registration details, a sign-in verification link is dispatched to the entered email for authentication, and profile details (Name, DOB, Email) are saved to Supabase.
- **Verification Redirect**: When the customer opens their email and clicks the sign-in link, the portal verifies their email and redirects them to the login page where they enter their email and password to sign in.

### 3. Continue with Google (via Supabase)
- **"Continue with Google"** option available on both Login and Signup tabs.
- Automated fallback collection workflow to ensure Date of Birth is provided even if omitted by Google's default privacy scope.

---

## 🛠️ Environment Configuration

Set up `.env` with your Supabase credentials:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://<your-project-id>.supabase.co
VITE_SUPABASE_ANON_KEY=<your-anon-key>

# Razorpay Test Key
VITE_RAZORPAY_KEY_ID=rzp_test_TfVrQ8ZYE8yoPj
```

---

## 🧪 Self-Checks & Build

```bash
# Run lightweight Ponytail verification checks
node check.mjs

# Build production bundle
npm run build
```
