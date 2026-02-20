# Deploy Next.js (Laundry) on cPanel – Step-by-step

Deployment uses **Apache + PM2 + Node.js 20 (NVM)**. Replace `trim.sigisolutions.net` / `trimnext` with your domain and app name if different.

---

## 1. Create subdomain (cPanel UI)

- **User:** sigisolutions (or your cPanel user)  
- **Where:** cPanel → **Subdomains** (or Domains)

Create subdomain:

- **Domain:** `trim.sigisolutions.net` (or your domain, e.g. `app.yourdomain.com`)
- **Document root:** `/home/sigisolutions/trim.sigisolutions.net`

This directory is only the Apache entry point; the app will live elsewhere.

---

## 2. Harden the document root (SSH)

**User:** sigisolutions  
**SSH into the server**, then:

```bash
cd /home/sigisolutions/trim.sigisolutions.net
```

**Create `.htaccess`:**

```bash
nano .htaccess
```

Paste:

```apache
Options -Indexes

<IfModule mod_headers.c>
  Header always set X-Content-Type-Options "nosniff"
  Header always set X-Frame-Options "SAMEORIGIN"
  Header always set Referrer-Policy "strict-origin-when-cross-origin"
</IfModule>

DirectoryIndex index.html
```

Save: `CTRL+O`, Enter, `CTRL+X`.

**Create placeholder `index.html`:**

```bash
nano index.html
```

```html
<html><body>Application is being configured.</body></html>
```

Save and exit.

---

## 3. Application directory

**User:** sigisolutions  
**SSH:**

```bash
mkdir -p /home/sigisolutions/apps/trimnext
```

Layout:

```
/home/sigisolutions/
├── apps/
│   └── trimnext/              ← Next.js app here
└── trim.sigisolutions.net/    ← Apache doc root (only .htaccess + index.html)
```

---

## 4. Node.js 20 via NVM

**User:** sigisolutions  
**Directory:** home (e.g. `/home/sigisolutions`)

**Install NVM (if not already):**

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
source ~/.bashrc
```

**Install and use Node 20:**

```bash
nvm install 20
nvm use 20
nvm alias default 20
node -v
npm -v
```

---

## 5. Upload application code

**Target:** `/home/sigisolutions/apps/trimnext`

Use **Git**, **SFTP**, or **ZIP** so this directory contains at least:

- `package.json`
- `next.config.js`
- `src/` (or `app/`)
- `public/`

**Example with Git:**

```bash
cd /home/sigisolutions/apps
git clone <your-repo-url> trimnext
cd trimnext
```

---

## 6. Environment variables

**User:** sigisolutions  
**Directory:** `/home/sigisolutions/apps/trimnext`

```bash
cd /home/sigisolutions/apps/trimnext
nano .env.local
```

Add all required variables (API URLs, keys, etc.). Save and exit.

**Restrict permissions:**

```bash
chmod 600 .env.local
```

---

## 7. Install dependencies and build

**User:** sigisolutions  
**Directory:** `/home/sigisolutions/apps/trimnext`

```bash
cd /home/sigisolutions/apps/trimnext
rm -rf node_modules package-lock.json
npm install
```

**Build (use one):**

```bash
npm run build
# or, for production env vars:
npm run build:production
```

Fix any build errors before continuing.

---

## 8. PM2 – run the app

**User:** sigisolutions  
**Directory:** `/home/sigisolutions/apps/trimnext`

**Install PM2 (if needed):**

```bash
npm install -g pm2
```

**Start the app on port 3000, bound to localhost only:**

```bash
cd /home/sigisolutions/apps/trimnext

pm2 start npm \
  --name trimnext \
  -- start -- -p 3000 -H 127.0.0.1
```

*(This overrides the port in `package.json` so the app listens on 3000 and only on 127.0.0.1.)*

**Persist the process list:**

```bash
pm2 save
```

**Check:**

```bash
pm2 status
ss -ltnp | grep 3000
curl -I http://127.0.0.1:3000
```

You should see PM2 **online**, something like `127.0.0.1:3000` listening, and HTTP 200 from `curl`.

---

## 9. Apache reverse proxy (root)

**User:** root  
**Method:** SSH or WHM Terminal

**Create proxy config directory:**

```bash
mkdir -p /etc/apache2/conf.d/userdata/ssl/2_4/sigisolutions/trim.sigisolutions.net
```

*(If your cPanel user is not `sigisolutions`, replace it. Path may be `conf.d` or `conf` depending on server.)*

**Create proxy config:**

```bash
nano /etc/apache2/conf.d/userdata/ssl/2_4/sigisolutions/trim.sigisolutions.net/proxy.conf
```

Paste (adjust domain if you used a different one):

```apache
ProxyPreserveHost On
ProxyRequests Off

RequestHeader set X-Forwarded-Proto "https"
RequestHeader set X-Forwarded-Port "443"

ProxyPass / http://127.0.0.1:3000/
ProxyPassReverse / http://127.0.0.1:3000/
```

Save and exit.

**Apply and restart Apache:**

```bash
/usr/local/cpanel/scripts/rebuildhttpdconf
systemctl restart httpd
```

*(On some systems the service is `apache2` instead of `httpd`.)*

---

## 10. SSL (cPanel UI)

**User:** sigisolutions  

- cPanel → **SSL/TLS Status**
- Run **AutoSSL** for the subdomain
- Confirm the subdomain shows as secured

---

## 11. Verify

```bash
curl -I https://trim.sigisolutions.net
```

Expected: `HTTP/1.1 200 OK` and `X-Powered-By: Next.js`.

Open in browser: `https://trim.sigisolutions.net`

---

## 12. (Optional) PM2 on reboot

**User:** sigisolutions:

```bash
pm2 startup
```

Run the command it prints (often as root), then:

```bash
pm2 save
```

---

## Maintenance

| Action        | Command                    |
|---------------|----------------------------|
| Restart app   | `pm2 restart trimnext`     |
| Stop app      | `pm2 stop trimnext`        |
| View logs     | `pm2 logs trimnext`        |
| Status        | `pm2 status`               |

---

## Troubleshooting: 502 Bad Gateway / Proxy Error

*"The proxy server received an invalid response from an upstream server"* or *"Error reading from remote server"* means Apache cannot get a valid response from your Node app. Check the following **on the server via SSH** (as the app user, e.g. sigisolutions).

### 1. Is the app running?

```bash
pm2 status
```

- If **trimnext** (or your app name) is **stopped** or **errored**, start or restart it:
  ```bash
  pm2 start trimnext
  # or
  pm2 restart trimnext
  ```
- If the app is not in the list, start it again (see step 8 in this doc).

### 2. Is anything listening on port 3000?

```bash
ss -ltnp | grep 3000
# or
netstat -tlnp | grep 3000
```

- You should see something like `127.0.0.1:3000`. If nothing appears, the app is not listening; check PM2 logs (step 4).

### 3. Can the server reach the app locally?

```bash
curl -I http://127.0.0.1:3000
```

- **200 OK** → app is fine; the problem may be Apache config or proxy path.
- **Connection refused** → app is not running or not on 3000; check PM2 and port.
- **No response / timeout** → app may be crashing on request or very slow; check PM2 logs.

### 4. Check application logs

```bash
pm2 logs trimnext --lines 100
```

- Look for **errors**, **EADDRINUSE** (port in use), **missing env vars**, or **crashes** on startup. Fix those, then `pm2 restart trimnext`.

### 5. Port and host in PM2

The app must listen on **127.0.0.1:3000** (not 0.0.0.0 if your Apache proxy is on the same host). Start command should be:

```bash
pm2 start npm --name trimnext -- start -- -p 3000 -H 127.0.0.1
```

If you used a different port, Apache’s `ProxyPass` must use the same port.

### 6. Apache proxy config

- Confirm the proxy file exists, e.g.:
  `/etc/apache2/conf.d/userdata/ssl/2_4/sigisolutions/trim.sigisolutions.net/proxy.conf`
- It should contain:
  ```apache
  ProxyPass / http://127.0.0.1:3000/
  ProxyPassReverse / http://127.0.0.1:3000/
  ```
- Rebuild and restart (as root):
  ```bash
  /usr/local/cpanel/scripts/rebuildhttpdconf
  systemctl restart httpd
  ```

### 7. Proxy modules enabled (root)

Apache needs `mod_proxy` and `mod_proxy_http`:

```bash
a2enmod proxy proxy_http
# then
systemctl restart httpd
```

*(Command may differ on your OS; on some cPanel servers these are already enabled.)*

### 8. Restart app after code or env changes

After changing `.env.local` or code:

```bash
cd /home/sigisolutions/apps/trimnext
pm2 restart trimnext
pm2 save
```

---

## Checklist

- [ ] Subdomain created, document root set
- [ ] `.htaccess` and placeholder `index.html` in document root
- [ ] App code in `/home/sigisolutions/apps/trimnext`
- [ ] NVM + Node 20 installed and in use
- [ ] `.env.local` created and `chmod 600`
- [ ] `npm install` and `npm run build` (or `build:production`) OK
- [ ] PM2 started with `-p 3000 -H 127.0.0.1`, `pm2 save` run
- [ ] Apache proxy config created and httpd restarted
- [ ] SSL enabled for the subdomain
- [ ] `https://your-subdomain` returns 200 and Next.js app

---

## Your project notes

- **App name in PM2:** use `trimnext` or change to e.g. `laundry` in the `pm2 start` command and in maintenance commands.
- **Port:** must be **3000** (or match what you put in Apache `ProxyPass`).
- **Scripts:** `npm run build:production` if you need production env at build time; PM2 runs `npm start` with port/host overridden.
