# ngrok Setup Guide

This guide will help you set up ngrok to share your local development server with others.

## Quick Start

1. **Start your development server** (in one terminal):

   ```bash
   npm run dev
   ```

2. **Start ngrok tunnel** (in another terminal):

   ```bash
   npm run tunnel
   ```

3. **Copy the ngrok URL** (it will look like `https://xxxx-xx-xx-xx-xx.ngrok-free.app`)

4. **Share the URL** with your friend - they can access your local server using this URL!

## What is ngrok?

ngrok creates a secure tunnel from the internet to your local machine, allowing others to access your local development server without you needing to deploy it.

## Alternative: Install ngrok Globally

If you prefer to install ngrok globally:

1. **Download ngrok** from https://ngrok.com/download
2. **Extract and add to PATH** (or use the executable directly)
3. **Run directly**:
   ```bash
   ngrok http 3000
   ```

## Important Notes

- **Free tier limitations**: The free tier gives you a random URL each time. For a fixed URL, you need a paid plan.
- **HTTPS**: ngrok provides HTTPS URLs automatically
- **Keep both terminals running**: Both your dev server and ngrok need to be running
- **URL changes**: Each time you restart ngrok, you'll get a new URL (unless you have a paid plan)

## Troubleshooting

- **Port already in use**: Make sure port 2323 is available and your dev server is running
- **Connection refused**: Ensure your Next.js dev server is running on port 2323
- **ngrok not found**: The script uses `npx` which will download ngrok automatically if needed

### WebSocket / HMR error: `WebSocket connection to 'wss://.../_next/webpack-hmr' failed`

**What it is:** Next.js dev server uses a WebSocket for **Hot Module Replacement (HMR)** so the browser can receive live code updates. When you open the app via a different host (e.g. `https://test.serviprapp.com` or an ngrok URL), the browser tries to connect to `wss://that-host/_next/webpack-hmr`. That connection often fails when:

1. **A reverse proxy** (nginx, Apache, cPanel) in front of your dev server does **not** forward WebSocket connections.
2. **A tunnel** (ngrok, Cloudflare Tunnel) does not upgrade WebSocket properly for `/_next/webpack-hmr`.

**Impact:** The app still loads and works; you just won’t get hot reload when you change code. You’ll need to refresh the page manually to see changes.

**Options:**

1. **Develop on localhost**  
   Use `http://localhost:2323` in the browser. HMR will connect to the same origin and work without any proxy/tunnel config.

2. **Fix the proxy** (if you must use `test.serviprapp.com` or similar)  
   Configure your reverse proxy to upgrade WebSocket for the dev app, for example:

   **Nginx:**

   ```nginx
   location /_next/webpack-hmr {
     proxy_pass http://localhost:2323;
     proxy_http_version 1.1;
     proxy_set_header Upgrade $http_upgrade;
     proxy_set_header Connection "upgrade";
     proxy_set_header Host $host;
   }
   ```

   **Apache** (with `mod_proxy_wstunnel`):

   ```apache
   ProxyPass /_next/webpack-hmr ws://localhost:2323/_next/webpack-hmr
   ProxyPassReverse /_next/webpack-hmr ws://localhost:2323/_next/webpack-hmr
   ```

3. **Ignore it**  
   If you don’t need HMR over the tunnel/domain, you can ignore the error and refresh the page when you change code.

## For Production-like Testing

If you need to test with specific domains or need a fixed URL, consider:

- ngrok paid plans (fixed domains)
- Cloudflare Tunnel (free alternative)
- LocalTunnel (free alternative)
