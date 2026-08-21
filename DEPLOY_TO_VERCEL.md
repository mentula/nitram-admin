# Deploy to Vercel - Permanent URL in 5 Minutes

## Why Vercel?
- ✅ Free forever
- ✅ Permanent URL (doesn't change)
- ✅ Works 24/7 (doesn't need your PC on)
- ✅ Automatic HTTPS
- ✅ Fast deployment
- ✅ Auto-updates when you push code

---

## Step 1: Install Vercel CLI

```powershell
npm install -g vercel
```

---

## Step 2: Login to Vercel

```powershell
vercel login
```

Follow the prompts (it's free!)

---

## Step 3: Deploy!

```powershell
cd C:\Users\user\Desktop\nitram-elevate-main\nitram-elevate-main

# Deploy
vercel
```

**Answer the prompts:**
- Set up and deploy? **Y**
- Which scope? **Your username**
- Link to existing project? **N**
- What's your project's name? **nitram-crm** (or anything)
- In which directory is your code located? **./** (press Enter)
- Want to override settings? **N**

**Wait 2 minutes...**

You'll get a URL like: `https://nitram-crm-abc123.vercel.app`

---

## Step 4: Add Environment Variables

```powershell
# Add Supabase URL
vercel env add VITE_SUPABASE_URL
# Paste: https://ekuifrbgozeqxvzmbnse.supabase.co

# Add Supabase Key
vercel env add VITE_SUPABASE_ANON_KEY
# Paste: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Add other vars
vercel env add VITE_SITE_NAME
# Paste: Nitram Logistics

vercel env add VITE_CONTACT_EMAIL
# Paste: info@nitramclearing.co.zm

vercel env add BYPASS_EMAIL
# Paste: true
```

---

## Step 5: Redeploy with Environment Variables

```powershell
vercel --prod
```

---

## Done! 🎉

Your site is now live at: `https://nitram-crm-abc123.vercel.app`

**Share this URL with anyone!**

---

## Update Your Site Later

Just run:
```powershell
vercel --prod
```

---

## Alternative: Deploy via GitHub

1. Push your code to GitHub:
   ```powershell
   git init
   git add .
   git commit -m "Deploy to Vercel"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/nitram-crm.git
   git push -u origin main
   ```

2. Go to: https://vercel.com/new
3. Click "Import" next to your repository
4. Add environment variables in the Vercel dashboard
5. Click "Deploy"
6. Done!

---

## Configure Supabase for Production URL

1. Go to: https://supabase.com/dashboard
2. Settings → Authentication
3. Update **Site URL** to: `https://your-vercel-url.vercel.app`
4. Add to **Redirect URLs**: `https://your-vercel-url.vercel.app/**`
5. Save

---

## Benefits Over Tunneling

| Feature | Vercel | ngrok | localhost |
|---------|--------|-------|-----------|
| Works 24/7 | ✅ Yes | ❌ Only when PC on | ❌ Only when PC on |
| Free | ✅ Yes | ✅ Yes | ✅ Yes |
| Permanent URL | ✅ Yes | ❌ Changes | ❌ localhost only |
| HTTPS | ✅ Yes | ✅ Yes | ❌ No |
| Fast | ✅ Yes | ⚠️ Medium | ✅ Yes |
| Setup time | 5 min | 2 min | 0 min |

---

## Troubleshooting

### Issue: Build fails
**Solution:** Check the Vercel build logs and fix any errors

### Issue: Environment variables not working
**Solution:** Make sure they're added in Vercel dashboard and redeployed

### Issue: Supabase auth not working
**Solution:** Update Supabase Site URL and Redirect URLs

### Issue: "vercel: command not found"
**Solution:** Run `npm install -g vercel` again, restart terminal

---

**Quick Start:**
```powershell
npm install -g vercel
vercel login
vercel
```

That's it! 🚀
