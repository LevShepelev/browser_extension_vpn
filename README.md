# Custom Chrome VPN/Proxy Extension

This extension lets you route Chrome traffic via your own server **when that server is reachable as an HTTP/HTTPS/SOCKS proxy**.

> ⚠️ Important limitation: Chrome extensions cannot create a full WireGuard/OpenVPN tunnel by themselves. They can only control browser proxy settings. If your Riga server currently works only via Outline/Amnezia apps, run a proxy endpoint there (for example SOCKS5) and use its host/port here.

## Features

- Enable/disable proxy routing from extension popup.
- Save server config in `chrome.storage`.
- Supports HTTP, HTTPS, SOCKS4, SOCKS5 proxies.
- Optional username/password proxy authentication.
- Optional bypass list for direct domains.

## Tech stack

- Manifest V3
- TypeScript
- React
- Vite

## Development

```bash
npm install
npm run build
```

Then load extension in Chrome:

1. Open `chrome://extensions`
2. Enable **Developer mode**
3. Click **Load unpacked**
4. Select this project folder (with `manifest.json`)

## Usage

1. Open extension popup.
2. Fill your proxy server details.
3. Click **Save settings**.
4. Click **Enable routing**.

To disable, click **Disable routing**.
