# Email Configuration with Resend

## Overview

The application uses [Resend](https://resend.com) for transactional email delivery (notifications, alerts, password resets, etc.).

## Setup Instructions

### Development Mode (Email Bypass)

If you want to test the application without setting up Resend email service:

1. **Enable Bypass Mode** in `.env.local`:
   ```bash
   BYPASS_EMAIL=true
   ```

2. **Restart your dev server:**
   ```bash
   # Press Ctrl+C to stop
   npm run dev
   ```

3. **How it works:**
   - Assessment form submissions will succeed
   - Data is logged to the console instead of being emailed
   - You can see all form data in your terminal/server logs
   - No actual emails are sent

4. **View the logs:**
   - Check your terminal where the dev server is running
   - Look for messages starting with `📧 ASSESSMENT FORM SUBMISSION`

### Production Mode (With Email)

For production deployment with real email sending:

### 1. Get Your Resend API Key

1. Go to [https://resend.com](https://resend.com)
2. Sign up or log in to your account
3. Navigate to **API Keys** section
4. Click **Create API Key**
5. Give it a name (e.g., "Nitram CRM Production")
6. Copy the generated API key (starts with `re_`)

### 2. Add to Local Development

**File:** `.env.local`

Replace the placeholder and disable bypass:
```bash
RESEND_API_KEY=re_your_actual_api_key_here
BYPASS_EMAIL=false
```

**Example:**
```bash
RESEND_API_KEY=re_123abc456def789ghi0jkl1mno2pqr
BYPASS_EMAIL=false
```

### 3. Add to Production Environment

Depending on your hosting platform:

#### **Vercel**
1. Go to your project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add:
   - **Key:** `RESEND_API_KEY`
   - **Value:** Your Resend API key
   - **Environment:** Production (and Preview if needed)
4. Redeploy your application

#### **Netlify**
1. Go to **Site settings** → **Environment variables**
2. Click **Add a variable**
3. Add:
   - **Key:** `RESEND_API_KEY`
   - **Value:** Your Resend API key
4. Redeploy your application

#### **Cloudflare Pages**
1. Go to your Pages project
2. Navigate to **Settings** → **Environment variables**
3. Add:
   - **Variable name:** `RESEND_API_KEY`
   - **Value:** Your Resend API key
   - **Environment:** Production
4. Redeploy your application

### 4. Verify Configuration

After adding the API key, restart your development server:

```bash
# Stop current server (Ctrl+C)
npm run dev
```

The error message should disappear once the `RESEND_API_KEY` is properly configured.

## Email Features

Once configured, the following features will work:

- ✉️ **Password Reset Emails** - Users can reset forgotten passwords
- ✉️ **Welcome Emails** - New user onboarding
- ✉️ **Notification Emails** - Shipment status updates
- ✉️ **Quote Notifications** - New quote requests
- ✉️ **Lead Alerts** - New lead notifications to admin

## Resend Pricing

**Free Tier:**
- 100 emails/day
- 3,000 emails/month
- Perfect for development and small-scale production

**Paid Plans:**
- Start at $20/month for 50,000 emails
- See [resend.com/pricing](https://resend.com/pricing) for details

## Domain Verification (Optional but Recommended)

For production, verify your domain to send emails from `@nitramclearing.co.zm`:

1. In Resend dashboard, go to **Domains**
2. Click **Add Domain**
3. Enter: `nitramclearing.co.zm`
4. Follow DNS configuration instructions
5. Add the provided DNS records to your domain registrar
6. Wait for verification (usually 24-48 hours)

Once verified, emails will be sent from addresses like:
- `notifications@nitramclearing.co.zm`
- `noreply@nitramclearing.co.zm`

Without domain verification, emails send from `@resend.dev` domain.

## Troubleshooting

### Error: "Email send failed (403)"
- **Cause:** API key is invalid, expired, or doesn't have permission to send emails
- **Solution:** 
  1. Enable bypass mode: `BYPASS_EMAIL=true` in `.env.local`
  2. Or get a new API key from Resend dashboard
  3. Check that the API key starts with `re_` and has no extra spaces

### Bypass Mode for Development
If you're getting email errors and want to continue development:
```bash
# In .env.local
BYPASS_EMAIL=true
```
This will:
- ✅ Allow the app to work without email service
- ✅ Log all form submissions to console
- ✅ Let you test the assessment form
- ❌ Not send actual emails

### Error: "Email service is not configured"
- **Cause:** `RESEND_API_KEY` is missing or invalid
- **Solution:** Check that the API key is correctly added to environment variables

### Emails not being sent
1. Check Resend dashboard for delivery logs
2. Verify API key is active (not revoked)
3. Check if you've exceeded free tier limits
4. Verify sender email address is valid

### Emails going to spam
- Verify your domain in Resend
- Set up SPF, DKIM, and DMARC records
- Use a professional "from" address
- Avoid spam trigger words in subject lines

## Support

- **Resend Documentation:** [https://resend.com/docs](https://resend.com/docs)
- **Resend Support:** support@resend.com
- **API Status:** [https://resend.com/status](https://resend.com/status)

## Security Notes

⚠️ **Important:**
- Never commit your API key to version control
- Keep `.env.local` in `.gitignore`
- Use different API keys for development and production
- Rotate API keys periodically
- Revoke unused keys immediately

---

**Last Updated:** 2024
