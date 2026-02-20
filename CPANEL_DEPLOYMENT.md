# Next.js on cPanel – Quick reference

Deployment uses **Apache + PM2 + Node.js 20 (NVM)**. App runs via PM2; Apache reverse-proxies to it. No “Setup Node.js App” is used.

## Stop the application (PM2)

```bash
# As user sigisolutions, from SSH:
pm2 stop trimnext
```

To stop and remove from PM2 list:

```bash
pm2 delete trimnext
```

## Stop a running build

If `npm run build` is running and you want to cancel it:

```bash
# Find the process
ps aux | grep "npm run build"
# or
ps aux | grep next

# Kill by PID
kill <PID>
# or force
kill -9 <PID>
```

Build is a one-time step; it exits when it finishes or when you kill it. Stopping the **app** is done with PM2 (above).

## Other PM2 maintenance (from your deployment doc)

```bash
pm2 restart trimnext
pm2 stop trimnext
pm2 logs trimnext
pm2 status
```

## App name and port

- **PM2 app name:** `trimnext`
- **Port:** `3000` (bound to `127.0.0.1` only)
- **App directory:** `/home/sigisolutions/apps/trimnext` (or your chosen path)

When deploying this laundry project, use the same layout and PM2 name (e.g. `trimnext` or rename to `laundry` in the `pm2 start` command).
