# Supabase Setup Guide: Google OAuth & Database Schemas

This guide provides step-by-step instructions for configuring **Supabase** for database management and Google OAuth authentication as required by the System Prompt Specification.

---

## 1. Database Table Schema Configuration

The authentication portal requires storing **Name**, **DOB (Date of Birth)**, and **Email ID**.

### Executing the Schema in Supabase SQL Editor
1. Log in to your [Supabase Dashboard](https://supabase.com/dashboard).
2. Select your project and navigate to the **SQL Editor** from the left navigation bar.
3. Open a new query tab and execute the SQL schema from [`supabase_schema.sql`](./supabase_schema.sql):

```sql
CREATE TABLE IF NOT EXISTS public.profiles (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    dob TEXT,
    phone TEXT DEFAULT '',
    role TEXT DEFAULT 'Student',
    usn TEXT DEFAULT '',
    pickup_zone TEXT DEFAULT '',
    place TEXT DEFAULT '',
    pincode TEXT DEFAULT '',
    address TEXT DEFAULT '',
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_dob ON public.profiles(dob);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read access for profiles"
    ON public.profiles FOR SELECT USING (true);

CREATE POLICY "Allow insert profile"
    ON public.profiles FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow update profile"
    ON public.profiles FOR UPDATE USING (true) WITH CHECK (true);
```

4. Click **Run**. The `profiles` table is now ready to store user credentials.

---

## 2. Google OAuth Provider Configuration

### Step A: Configure Google Cloud Console
1. Go to the [Google Cloud Console](https://console.cloud.google.com/).
2. Create a new project or select an existing project.
3. Navigate to **APIs & Services** > **OAuth consent screen**:
   - User Type: **External**.
   - App Name: `Campus Canteen Portal`.
   - User support email: Select your developer email.
   - Developer contact information: Enter your email.
   - Save and continue.
4. Navigate to **APIs & Services** > **Credentials**:
   - Click **Create Credentials** > **OAuth client ID**.
   - Application type: **Web application**.
   - Name: `Supabase Auth Client`.
   - **Authorized redirect URIs**: Add your Supabase callback URL:
     ```
     https://<YOUR-SUPABASE-PROJECT-REF>.supabase.co/auth/v1/callback
     ```
   - Click **Create**.
   - Copy the generated **Client ID** and **Client Secret**.

### Step B: Enable Google Provider in Supabase
1. In your Supabase Dashboard, navigate to **Authentication** > **Providers**.
2. Select **Google** from the list of providers.
3. Toggle **Enable Google provider** to ON.
4. Paste the **Client ID** and **Client Secret** obtained from Google Cloud Console.
5. Click **Save**.

---

## 3. OAuth Scopes for Name and DOB

In modern Google OAuth 2.0, standard profile scopes return Name and Email, but Date of Birth requires the Google People API birthday scope:
```
openid email profile https://www.googleapis.com/auth/user.birthday.read
```

Our frontend client automatically requests these scopes during the sign-in redirect:
```typescript
await supabase.auth.signInWithOAuth({
  provider: 'google',
  options: {
    scopes: 'openid email profile https://www.googleapis.com/auth/user.birthday.read',
    redirectTo: window.location.origin,
  },
});
```

---

## 4. Fallback UI Workflow for DOB

Google's default scopes often do not return the Date of Birth (due to privacy settings or user accounts not having public birthdays).

As specified in **Feature 3**:
- When the user signs in with Google and redirects back to the portal:
- The backend/frontend sync checks if `dob` exists in `profiles`.
- If missing, the **Fallback UI Modal** is immediately displayed to the user:
  ```
  "Date of Birth Required: Welcome, <Google Name>! Google does not share your Date of Birth by default. Please provide it to complete setup."
  ```
- The user inputs their Date of Birth.
- The entered DOB, along with the exact Google Name and Email, is saved directly to the Supabase `profiles` table.
- Setup completes and the user is authenticated.

---

## 5. Environment Variables

Add your Supabase keys to your `.env` file:

```env
VITE_SUPABASE_URL=https://<YOUR-PROJECT-REF>.supabase.co
VITE_SUPABASE_ANON_KEY=<YOUR-ANON-PUBLIC-KEY>
```
