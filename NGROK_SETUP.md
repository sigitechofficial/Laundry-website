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

- **Port already in use**: Make sure port 3000 is available and your dev server is running
- **Connection refused**: Ensure your Next.js dev server is running on port 3000
- **ngrok not found**: The script uses `npx` which will download ngrok automatically if needed

## For Production-like Testing

If you need to test with specific domains or need a fixed URL, consider:
- ngrok paid plans (fixed domains)
- Cloudflare Tunnel (free alternative)
- LocalTunnel (free alternative)

