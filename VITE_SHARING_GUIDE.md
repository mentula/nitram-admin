# Share Your Vite App - Complete Guide

Your app uses **Vite + TanStack Start**, so you have special built-in options!

---

## Method 1: Vite Built-In Network Sharing ⭐

**Easiest - Use Vite's built-in feature:**

```powershell
npm run dev:host
```

You'll see:
```
➜  Local:   http://localhost:8080/
➜  Network: http://192.168.1.100:8080/
```

**Share the Network URL** (`http://192.168.1.100:8080`) with anyone on:
- Same WiFi network
- Your phone hotspot
- Same office network

**Benefits:**
- ✅ No installation needed
- ✅ Built into Vite
- ✅ Fast and simple
- ✅ Works immediately

**Limitations:**
- ❌ Only works on same network
- ❌ Need to be on same WiFi

---

## Method 2: Vite + Expose to Internet (0.0.0.0)

For maximum accessibility:

```powershell
npm run dev:share
```

This binds to `0.0.0.0` which means:
- Accessible from any device on your network
- Works with phone hotspot
- Works with VPN (like Tailscale)

---

## Method 3: Vite + Tailscale (Best for Remote!)

**Create a secure private network:**

### Step 1: Install Tailscale
```powershell
winget install tailscale.tailscale
```

### Step 2: Sign up & Connect
1. Open Tailscale (system tray icon)
2. Sign up (free)
3. Connect your PC

### Step 3: Start Dev Server
```powershell
npm run dev:share
```

### Step 4: Share Your Tailscale IP
1. Look at Tailscale icon
2. Copy your Tailscale IP (looks like `100.x.x.x`)
3. Share: `http://100.x.x.x:8080`

### Step 5: They Install Tailscale
1. Friend installs Tailscale
2. You add them to your network
3. They can access your URL!

**Benefits:**
- ✅ Super secure (encrypted)
- ✅ Works anywhere (not just same WiFi)
- ✅ No public URL needed
- ✅ Fast (direct connection)
- ✅ Free for personal use

---

## Method 4: Vite + Custom Port

If port 8080 is busy:

Update `vite.config.ts`:

```typescript
export default defineConfig({
  // ... existing config
  vite: {
    server: {
      port: 3000,        // Change port
      host: true,        // Expose to network
      strictPort: false  // Use different port if busy
    },
    plugins: [],
  },
});
```

Then run:
```powershell
npm run dev
```

---

## Method 5: Vite Preview Mode (Production Build)

Test the production build locally:

```powershell
# Build for production
npm run build

# Preview with network access
npm run preview -- --host
```

You'll get a production-ready URL to share!

---

## Method 6: Vite + Cloudflare Tunnel

Best of both worlds - Vite dev server + public URL:

### Terminal 1:
```powershell
npm run dev:share
```

### Terminal 2:
```powershell
# Install Cloudflare (one time)
winget install Cloudflare.cloudflared

# Create tunnel
cloudflared tunnel --url http://localhost:8080
```

Copy the URL and share!

---

## Method 7: Vite + Deploy to Vercel

Since your `vite.config.ts` already has `preset: "vercel"`, you're ready!

```powershell
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel
```

You get a permanent URL like: `https://nitram-crm.vercel.app`

**Benefits:**
- ✅ Already configured in your project!
- ✅ Permanent URL
- ✅ Works 24/7
- ✅ Free

---

## Configuration Tips

### Update .env.local for Network Access

When using `--host`, update your environment:

```bash
# For local development
VITE_SITE_URL=http://localhost:8080

# For network access (get your IP from ipconfig)
VITE_SITE_URL=http://192.168.1.100:8080

# For Tailscale
VITE_SITE_URL=http://100.x.x.x:8080

# For public tunnel
VITE_SITE_URL=https://your-tunnel-url.com
```

### Update Supabase Redirect URLs

If using authentication:

1. Go to: https://supabase.com/dashboard
2. Settings → Authentication
3. Add your new URL to **Redirect URLs**:
   - Local: `http://192.168.1.100:8080/**`
   - Tailscale: `http://100.x.x.x:8080/**`
   - Public: `https://your-tunnel-url.com/**`

---

## Troubleshooting

### Issue: "Cannot access from other devices"
**Solution:** 
- Use `npm run dev:share` instead of `npm run dev`
- Check Windows Firewall (allow port 8080)
- Make sure devices are on same network

### Issue: "ERR_CONNECTION_REFUSED"
**Solution:**
- Verify dev server is running
- Check the port number (8080)
- Disable Windows Firewall temporarily to test

### Issue: "Network URL not showing"
**Solution:**
- Run with `--host` flag: `npm run dev:host`
- Check your network connection

### Issue: Windows Firewall Blocking
**Solution:**
```powershell
# Allow Node through firewall (run as Administrator)
netsh advfirewall firewall add rule name="Vite Dev Server" dir=in action=allow protocol=TCP localport=8080
```

---

## Performance Tips

### 1. Enable HMR Over Network
Vite's Hot Module Replacement works over network too! Just make sure:
- Use `--host` flag
- Browser can reach your dev server

### 2. Use HTTPS (Optional)
For testing HTTPS locally:

```powershell
# Install mkcert
winget install FiloSottile.mkcert

# Create local certificate
mkcert -install
mkcert localhost 192.168.1.100
```

Update `vite.config.ts`:
```typescript
import fs from 'fs';

export default defineConfig({
  vite: {
    server: {
      https: {
        key: fs.readFileSync('localhost-key.pem'),
        cert: fs.readFileSync('localhost.pem'),
      },
      host: true
    },
  },
});
```

---

## Quick Scripts Reference

I've added these to your `package.json`:

```json
{
  "dev": "vite dev",              // Normal local development
  "dev:host": "vite dev --host",  // Expose to network (auto-detect IP)
  "dev:share": "vite dev --host 0.0.0.0"  // Expose to all interfaces
}
```

Use:
- `npm run dev` - Normal localhost only
- `npm run dev:host` - Share on network
- `npm run dev:share` - Maximum compatibility

---

## My Recommendations for Your Setup

### For Quick Demo (Same City):
```powershell
npm run dev:host
# Share Network URL with anyone on same WiFi
```

### For Remote Demo (Different City):
**Option A - Tailscale (Most Secure):**
```powershell
# Install Tailscale on both PCs
npm run dev:share
# Share Tailscale IP
```

**Option B - Deploy to Vercel (Most Professional):**
```powershell
vercel
# Already configured in your vite.config.ts!
```

### For Client Presentation:
**Deploy to Vercel** - permanent URL, professional

---

## Vite-Specific Advantages

Your Vite setup gives you:
- ✅ Lightning fast HMR (Hot Module Replacement)
- ✅ Built-in network sharing (`--host`)
- ✅ Pre-configured for Vercel deployment
- ✅ Optimized build process
- ✅ TypeScript support out of the box

---

## Example Workflow

**Scenario: Show to someone in another city**

```powershell
# Terminal 1: Start Vite dev server with network access
npm run dev:share

# Terminal 2: Create tunnel (choose one)

# Option A: Cloudflare (fastest)
cloudflared tunnel --url http://localhost:8080

# Option B: Tailscale (most secure)
# Install Tailscale, share your Tailscale IP

# Option C: Deploy to Vercel (most professional)
vercel
```

---

## Summary

**Built into Vite:**
- `npm run dev:host` - Share on local network
- `npm run dev:share` - Maximum compatibility

**Add a tunnel for internet access:**
- Tailscale - Private, secure
- Cloudflare - Public, fast
- Vercel - Permanent, professional

**Your project is already optimized for sharing!** 🚀
