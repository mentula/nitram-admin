# Email Bypass Mode - Quick Guide

## Problem
Getting `Email send failed (403)` error when testing the assessment form.

## Solution
Email bypass mode allows the application to work without the Resend email service.

## How to Enable

### Step 1: Update Environment File

**File:** `.env.local`

Set this variable:
```bash
BYPASS_EMAIL=true
```

Your `.env.local` should look like:
```bash
# Supabase Configuration
VITE_SUPABASE_URL=https://ekuifrbgozeqxvzmbnse.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Site Configuration
VITE_SITE_URL=http://localhost:8080
VITE_SITE_NAME=Nitram Logistics
VITE_CONTACT_EMAIL=info@nitramclearing.co.zm

# Email Configuration (Resend)
RESEND_API_KEY=re_ScnV1haa_FvihJsvN5BaqNrpXkBYH3U7s

# Email Bypass Mode (Development)
BYPASS_EMAIL=true
```

### Step 2: Restart Development Server

```bash
# Stop the current server (Ctrl+C)
npm run dev
```

### Step 3: Test the Assessment Form

1. Navigate to `/assessment` in your browser
2. Fill out the form
3. Submit the form
4. ✅ Should see success message
5. 📋 Check your terminal/console for the logged data

## What Happens in Bypass Mode

### ✅ What Works
- Assessment form submission succeeds
- Form validation still works
- File attachments are processed
- Data is logged to the console
- User sees success message

### 📋 Where Data Goes
Instead of sending emails, the data is logged to your terminal:

```
========================================
📧 ASSESSMENT FORM SUBMISSION (EMAIL BYPASSED)
========================================
Subject: New Lead — John Doe (Customs Clearing)
To: info@nitramclearing.co.zm
Reply-to: john@example.com

Form Data:
  Full Name: John Doe
  Company Name: ABC Trading
  Email: john@example.com
  Phone Number: +260 123 456 789
  Service Required: Customs Clearing
  ...

Attachments:
  - Commercial Invoice: invoice.pdf (245.3 KB)
  - Bill of Lading: bol.pdf (189.7 KB)
========================================
```

### ❌ What Doesn't Work
- No actual emails are sent
- Recipients won't receive notifications
- Email attachments aren't delivered

## When to Use Bypass Mode

✅ **Use bypass mode for:**
- Local development
- Testing form functionality
- When you don't have a Resend API key
- When Resend is having issues
- Demo/presentation purposes

❌ **Don't use bypass mode for:**
- Production deployments
- When you need actual email delivery
- Client-facing environments

## Disabling Bypass Mode

When you're ready to enable real email sending:

### Step 1: Get Resend API Key
1. Sign up at [https://resend.com](https://resend.com)
2. Navigate to **API Keys**
3. Create a new key
4. Copy the key (starts with `re_`)

### Step 2: Update Environment File

**File:** `.env.local`

```bash
RESEND_API_KEY=re_your_actual_api_key_here
BYPASS_EMAIL=false
```

### Step 3: Restart Server

```bash
# Stop the current server (Ctrl+C)
npm run dev
```

Now emails will be sent for real!

## Production Deployment

For production (Vercel/Netlify/Cloudflare):

### Option 1: Enable Bypass (Testing Only)
Add environment variable:
- **Key:** `BYPASS_EMAIL`
- **Value:** `true`

### Option 2: Enable Real Emails (Recommended)
Add environment variables:
- **Key:** `RESEND_API_KEY`
- **Value:** Your Resend API key
- **Key:** `BYPASS_EMAIL`
- **Value:** `false` (or omit this variable)

## Checking Bypass Status

Look for this message in your server logs when starting the app:

```
[BYPASS MODE] Email sending is disabled. Assessment data will be logged instead.
```

If you see this message, bypass mode is active.

---

**Quick Summary:**
- Set `BYPASS_EMAIL=true` in `.env.local`
- Restart dev server
- Form submissions will log to console instead of sending emails
- Perfect for development and testing!
