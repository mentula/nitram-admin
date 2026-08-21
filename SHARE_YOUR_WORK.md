# 🌐 Share Your Work Remotely

## Quick 3-Step Setup

### Step 1: Install ngrok (One Time Only)

Open PowerShell and run:
```powershell
winget install ngrok
```

Or download from: **https://ngrok.com/download**

### Step 2: Sign Up & Get Token (One Time Only)

1. Go to: **https://dashboard.ngrok.com/signup**
2. Sign up (it's free!)
3. Copy your auth token
4. Run in PowerShell:
   ```powershell
   ngrok config add-authtoken YOUR_TOKEN_HERE
   ```

### Step 3: Start Sharing (Every Time)

**Terminal 1 - Start your dev server:**
```powershell
cd C:\Users\user\Desktop\nitram-elevate-main\nitram-elevate-main
npm run dev
```

**Terminal 2 - Expose to internet:**
```powershell
ngrok http 8080
```

**Copy the URL and share it!**
```
Forwarding   https://abc123.ngrok-free.app -> http://localhost:8080
             ^^^^^^^^^^^^^^^^^^^^^^^^^^^^
             Send this URL to anyone!
```

---

## Alternative: Even Faster (No Signup)

If you don't want to sign up:

```powershell
# Install Cloudflare (one time)
winget install Cloudflare.cloudflared

# Expose your server (every time)
cloudflared tunnel --url http://localhost:8080
```

Copy the URL that appears and share it!

---

## ⚠️ Don't Forget: Update Supabase

After getting your public URL:

1. Go to: **https://supabase.com/dashboard**
2. Settings → Authentication
3. Update **Site URL** to your tunnel URL
4. Add tunnel URL to **Redirect URLs**
5. Save

Then update `.env.local`:
```bash
VITE_SITE_URL=https://your-tunnel-url.ngrok-free.app
```

Restart your dev server (`Ctrl+C` then `npm run dev`)

---

## Use the Script (Easiest Way)

Just run:
```powershell
.\start-tunnel.ps1
```

Follow the prompts!

---

## When You're Done

Press **Ctrl+C** in the ngrok/cloudflare terminal to stop sharing.

Your work is safe - the tunnel only works while it's running!

---

## Video Demo Flow

**Perfect for showing someone your work:**

1. Start tunnel
2. Send them the URL
3. They open it in their browser
4. You make changes in your code
5. They refresh - see updates instantly!
6. Done? Press Ctrl+C to stop

**It's like screen sharing, but they control the browser!** 🎉
