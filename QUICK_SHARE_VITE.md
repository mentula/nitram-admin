# Quick Share with Vite - Cheat Sheet

## 🚀 I've added new commands to package.json

### Local Network (Same WiFi)
```powershell
npm run dev:host
```
→ Share the Network URL with anyone on same WiFi

### Maximum Compatibility
```powershell
npm run dev:share
```
→ Binds to 0.0.0.0 (works with VPN, hotspot, etc.)

### Normal Development
```powershell
npm run dev
```
→ Localhost only (as before)

---

## 🌐 Share to Someone Remote

### Option 1: Vite + Tailscale (Secure & Fast)
```powershell
# Install Tailscale (one time)
winget install tailscale.tailscale

# Start dev server
npm run dev:share

# Share your Tailscale IP: http://100.x.x.x:8080
# They install Tailscale too, you add them to network
```

### Option 2: Vite + Cloudflare (Public URL)
```powershell
# Terminal 1
npm run dev:share

# Terminal 2
winget install Cloudflare.cloudflared
cloudflared tunnel --url http://localhost:8080

# Share the URL it gives you
```

### Option 3: Deploy to Vercel (Permanent)
```powershell
npm install -g vercel
vercel

# Get permanent URL: https://nitram-crm.vercel.app
```

---

## 🔥 Absolute Fastest

**Same WiFi:**
```powershell
npm run dev:host
```
Done! Share the Network URL.

**Remote Person:**
```powershell
# Terminal 1:
npm run dev:share

# Terminal 2:
ssh -p 443 -R0:localhost:8080 a.pinggy.io
```
Share the URL. Zero installation!

---

## 💡 Pro Tip: Windows Firewall

If others can't connect, allow port 8080:

```powershell
# Run as Administrator
netsh advfirewall firewall add rule name="Vite Dev" dir=in action=allow protocol=TCP localport=8080
```

---

## 📖 Full Guide
See `VITE_SHARING_GUIDE.md` for detailed instructions!
