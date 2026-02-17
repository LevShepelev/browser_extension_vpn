# Custom Chrome VPN/Proxy Extension

This project is a Chrome extension that routes **Chrome browser traffic** through your own server.

---

## Important limitation (please read first)

A Chrome extension **cannot create a full system VPN tunnel** (WireGuard/OpenVPN/Amnezia-style device tunnel) by itself.

What this extension does:
- Controls Chrome proxy settings (`chrome.proxy`) and sends browser requests through a proxy server.

What this extension does NOT do:
- It does not build a kernel-level VPN tunnel.
- It does not route traffic of other apps (Telegram desktop, games, etc.).

So your Riga VPS must expose a proxy endpoint (HTTP/HTTPS/SOCKS4/SOCKS5) that Chrome can use.

---

## Tech stack

- Manifest V3
- TypeScript
- React
- Vite

---

## What you need on your VPS (Riga)

To connect this extension to your VPS, you must have:

1. **Public server IP or domain**
2. **Proxy port** open in firewall (example: `1080`, `3128`, or custom)
3. **Proxy protocol**:
   - `socks5` (recommended), or
   - `socks4`, `http`, `https`
4. Optional but recommended:
   - **Username/password authentication**
   - Firewall rules allowing only required source IP ranges
   - Monitoring/logging

### Data you will enter in the extension

- **Host**: VPS IP or domain (example `203.0.113.10` or `proxy.example.com`)
- **Port**: proxy port (example `1080`)
- **Scheme**: `SOCKS5` / `SOCKS4` / `HTTP` / `HTTPS`
- **Username** (if your proxy requires auth)
- **Password** (if your proxy requires auth)
- **Bypass list** (domains that should go direct, e.g. `localhost, 127.0.0.1`)

---

## Windows: full install guide (step-by-step)

## 1) Install required software on Windows

1. Install **Node.js LTS** (includes npm):
   - https://nodejs.org/
2. Install **Git for Windows**:
   - https://git-scm.com/download/win
3. Install **Google Chrome** (latest stable).
4. Open **PowerShell** (or Windows Terminal).

Check installed versions:

```powershell
node -v
npm -v
git --version
```

---

## 2) Get this project on your PC

If you already have the project folder, skip this step.

```powershell
git clone <YOUR_REPOSITORY_URL>
cd browser_extension_vpn
```

---

## 3) Install dependencies

```powershell
npm install
```

If corporate/security policy blocks npm registry, configure registry/proxy accordingly or use a network that allows npm packages.

---

## 4) Build extension files

```powershell
npm run build
```

After build, `dist/` should contain compiled files and `manifest.json`.

---

## 5) Add extension to Chrome (Load unpacked)

1. Open Chrome and go to: `chrome://extensions`
2. Enable **Developer mode** (top-right toggle).
3. Click **Load unpacked**.
4. Select the project `dist` folder (recommended) or project root with `manifest.json`.
5. You should now see **Custom VPN Proxy Controller** in the extension list.
6. (Optional) Click the pin icon in Chrome toolbar so extension is easy to open.

When you change code:
- Run `npm run build` again
- In `chrome://extensions`, click **Reload** for this extension

---

## 6) Configure your VPS inside extension popup

1. Click extension icon.
2. Fill:
   - **Host**: your VPS IP/domain
   - **Port**: proxy port
   - **Scheme**: usually `SOCKS5`
   - **Username/Password** if configured on server
   - **Bypass list**: e.g. `localhost, 127.0.0.1`
3. Click **Save settings**.
4. Click **Enable routing**.

To stop routing, click **Disable routing**.

---

## 7) Verify traffic goes through VPS

1. Enable routing in extension.
2. Open `https://ifconfig.me` or `https://ipinfo.io` in Chrome.
3. IP/country should match your VPS location (Riga/Latvia if your VPS is there).

If IP does not change:
- Check Host/Port/Scheme
- Confirm firewall allows proxy port
- Confirm proxy service is running
- Confirm username/password are correct

---

## If you currently use Outline / Amnezia

Outline/Amnezia clients typically establish their own tunneling method. Chrome extension cannot directly “import” those tunnel configs unless a standard proxy endpoint is exposed.

You have two practical options:

1. **Run a dedicated proxy service on VPS** (SOCKS5/HTTP) and use it directly in this extension.
2. **Create an SSH SOCKS tunnel from your Windows PC** and point extension to local SOCKS endpoint.
   - Example command:
     ```powershell
     ssh -N -D 127.0.0.1:1080 user@YOUR_VPS_IP
     ```
   - Then in extension use:
     - Host: `127.0.0.1`
     - Port: `1080`
     - Scheme: `SOCKS5`

Option #1 is usually better for permanent usage.

---

## Security recommendations

- Prefer authenticated proxy (username/password at minimum).
- Restrict VPS firewall to only required ports.
- Keep your server updated.
- Use strong passwords/secrets.
- If using HTTP proxy over public internet, consider wrapping in TLS/stunnel or prefer SOCKS over SSH tunnel.

---

## Development commands

```bash
npm install
npm run dev
npm run build
npm run check
```

---

## Troubleshooting

### `Failed to fetch` or pages not loading after enabling
- Proxy server unreachable or blocked by firewall.
- Wrong protocol selected (e.g., HTTP selected but server is SOCKS5).

### Auth popup keeps appearing
- Wrong username/password.
- Server expects different auth method.

### Extension installed but no effect
- Confirm it is enabled in `chrome://extensions`.
- Confirm you clicked **Enable routing** in popup.
- Check another extension/policy is not overriding proxy settings.

### npm install errors on Windows
- Check internet/proxy restrictions.
- Run PowerShell as normal user with internet access.
- Retry with:
  ```powershell
  npm cache verify
  npm install
  ```

