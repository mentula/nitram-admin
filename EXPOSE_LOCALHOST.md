# Expose Localhost to Internet - Quick Guide

## Why?
Share your local development server with someone in another city/country.

---

## Method 1: ngrok (Recommended) ⭐

### One-Time Setup

1. **Install ngrok:**
   ```powershell
   winget install ngrok
   ```
   Or download from: https://ngrok.com/download

2. **Sign up for free account:**
   - Go to: https://dashboard.ngrok.com/signup
   - Create account
   - Copy your auth token

3. **Add auth token:**
   ```powershell
   ngrok config add-authtoken YOUR_TOKEN_HERE
   ```

### Every Time You Want to Share

1. **Start your dev server:**
   ```powershell
   cd C:\Users\user\Desktop\nitram-elevate-main\nitram-elevate-main
   npm run dev
   ```

2. **Open NEW terminal and run:**
   ```powershell
   ngrok http 8080
   ```

3. **Copy the HTTPS URL:**
   ```
   Forwarding   https://abc123.ngrok-free.app -> http://localhost:8080
   ```

4. **Share that URL with anyone!**

### Features:
- ✅ Free forever
- ✅ HTTPS automatically
- ✅ Works with Supabase auth
- ✅ Stable URL (with paid plan)
- ✅ Inspect traffic in web UI: http://127.0.0.1:4040

---

## Method 2: Cloudflare Tunnel (Faster)

### One-Time Setup

```powershell
winget install Cloudflare.cloudflared
```

Or download from: https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/downloads/

### Every Time You Want to Share

1. **Start your dev server:**
   ```powershell
   npm run dev
   ```

2. **Open NEW terminal:**
   ```powershell
   cloudflared tunnel --url http://localhost:8080
   ```

3. **Copy the URL:**
   ```
   https://abc-def-ghi.trycloudflare.com
   ```

4. **Share it!**

### Features:
- ✅ No signup needed
- ✅ Free forever
- ✅ Faster than ngrok
- ✅ HTTPS automatically
- ❌ URL changes every time

---

## Method 3: localtunnel

### One-Time Setup

```powershell
npm install -g localtunnel
```

### Every Time You Want to Share

1. **Start dev server:**
   ```powershell
   npm run dev
   ```

2. **Open NEW terminal:**
   ```powershell
   lt --port 8080 --subdomain nitram-demo
   ```

3. **Copy the URL:**
   ```
   https://nitram-demo.loca.lt
   ```

4. **Share it!**

**Note:** Visitors will see a warning page first. Click "Continue" to access.

---

## ⚠️ Configure Supabase for Public URL

### Step 1: Update Supabase Dashboard

1. Go to: https://supabase.com/dashboard
2. Select project: **ekuifrbgozeqxvzmbnse**
3. Go to **Settings** → **Authentication**
4. Find **"Site URL"** and set it to your tunnel URL:
   ```
   https://your-tunnel-url.ngrok-free.app
   ```
5. Find **"Redirect URLs"** and add:
   ```
   https://your-tunnel-url.ngrok-free.app/**
   ```
6. Click **Save**

### Step 2: Update .env.local

```bash
# In .env.local, change:
VITE_SITE_URL=http://localhost:8080

# To:
VITE_SITE_URL=https://your-tunnel-url.ngrok-free.app
```

### Step 3: Restart Dev Server

```powershell
# Press Ctrl+C, then:
npm run dev
```

---

## Comparison

| Feature | ngrok | Cloudflare | localtunnel |
|---------|-------|------------|-------------|
| Free | ✅ Yes | ✅ Yes | ✅ Yes |
| No signup | ❌ No | ✅ Yes | ✅ Yes |
| Custom subdomain (free) | ❌ Paid | ❌ Random | ✅ Yes |
| Speed | Good | Fast | Good |
| HTTPS | ✅ Yes | ✅ Yes | ✅ Yes |
| Stable URL | ❌ Changes | ❌ Changes | ✅ Stable |
| Warning page | ❌ No | ❌ No | ⚠️ Yes |
| Supabase compatible | ✅ Yes | ✅ Yes | ✅ Yes |

**Recommendation:** Use **ngrok** for best experience.

---

## Security Notes

⚠️ **Important:**
- Your local server is now PUBLIC
- Anyone with the URL can access it
- Don't share sensitive data
- Don't commit your .env.local with public URLs
- Stop the tunnel when done (`Ctrl+C`)

✅ **Safe because:**
- Tunnel closes when you close terminal
- URL is random/hard to guess
- Only works while your computer is on
- HTTPS is automatically enabled

---

## Troubleshooting

### Issue: "Tunnel not working"
**Solution:** Make sure your dev server is running first on `localhost:8080`

### Issue: "Supabase auth fails"
**Solution:** Update Supabase redirect URLs (see configuration section above)

### Issue: "Tunnel is slow"
**Solution:** Try Cloudflare Tunnel instead of ngrok

### Issue: "ngrok command not found"
**Solution:** 
- Restart terminal after installation
- Or use full path: `C:\Path\To\ngrok.exe http 8080`

### Issue: "Port 8080 already in use"
**Solution:** Check what port your dev server is actually running on (might be 8081 or 5173)

---

## Example Workflow

```powershell
# Terminal 1: Start dev server
cd C:\Users\user\Desktop\nitram-elevate-main\nitram-elevate-main
npm run dev

# Terminal 2: Expose with ngrok
ngrok http 8080

# Copy the URL from ngrok output:
# https://abc123.ngrok-free.app

# Send this URL to your colleague:
# "Check out what I'm building: https://abc123.ngrok-free.app"

# When done, press Ctrl+C in both terminals
```

---

## Pro Tips

1. **Keep the same subdomain (ngrok paid):**
   - Upgrade to paid ($8/month)
   - Get permanent subdomain: `https://nitram-demo.ngrok.app`
   - No need to update Supabase each time

2. **Password protect (ngrok):**
   ```powershell
   ngrok http 8080 --basic-auth="username:password"
   ```

3. **Inspect traffic:**
   - Open: http://127.0.0.1:4040
   - See all requests to your tunnel

4. **Use ngrok config file:**
   Create `ngrok.yml`:
   ```yaml
   tunnels:
     nitram:
       proto: http
       addr: 8080
       subdomain: nitram-demo  # Paid only
   ```
   Run: `ngrok start nitram`

---

**Quick Start:**
1. Install ngrok: `winget install ngrok`
2. Sign up: https://dashboard.ngrok.com/signup
3. Add token: `ngrok config add-authtoken YOUR_TOKEN`
4. Start dev: `npm run dev`
5. Expose: `ngrok http 8080`
6. Share the URL! 🚀
