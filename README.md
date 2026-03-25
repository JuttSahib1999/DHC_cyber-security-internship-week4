# 🛡️ DHC Cybersecurity Internship — Week 4
## Advanced Threat Detection & Web Security Enhancements

<div align="center">

![Node.js](https://img.shields.io/badge/Node.js-18.x-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Express](https://img.shields.io/badge/Express-4.18-000000?style=for-the-badge&logo=express&logoColor=white)
![SQLite](https://img.shields.io/badge/SQLite-3-003B57?style=for-the-badge&logo=sqlite&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-Auth-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white)
![Helmet](https://img.shields.io/badge/Helmet-CSP%20%2B%20HSTS-blueviolet?style=for-the-badge)
![License](https://img.shields.io/badge/License-ISC-blue?style=for-the-badge)

**Author:** Abdul Muqeet Tabraiz &nbsp;|&nbsp; **Organization:** DHC &nbsp;|&nbsp; **Deadline:** 27th March, 2026

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Security Features](#-security-features-implemented)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [API Reference](#-api-reference)
- [Testing the Security Features](#-testing-the-security-features)
- [Security Headers](#-security-headers)
- [Intrusion Detection](#-intrusion-detection--logging)
- [Screenshots](#-screenshots)
- [Technologies Used](#-technologies-used)

---

## 🎯 Overview

This repository contains Week 4 of my 6-week Cybersecurity Internship at DHC. Building on the vulnerable app from Week 1 and the secured version from Week 2-3, this week focuses on **advanced threat detection**, **API hardening**, and **security header implementation**.

The project demonstrates a complete security lifecycle — from a deliberately vulnerable Node.js application to a fully hardened, production-ready API server.

### What Was Built This Week

| Task | Goal | Status |
|------|------|--------|
| Intrusion Detection & Monitoring | Real-time threat detection with Winston + Fail2Ban | ✅ Done |
| API Security Hardening | Rate limiting, CORS, API Keys, JWT authentication | ✅ Done |
| Security Headers & CSP | Helmet with Content-Security-Policy and HSTS | ✅ Done |

---

## 🔒 Security Features Implemented

### 1. Rate Limiting — `express-rate-limit`
Prevents brute-force attacks by limiting request frequency:

| Limiter | Endpoint | Limit | Window | Action on Breach |
|---------|----------|-------|--------|-----------------|
| Global | All routes | 100 requests | 15 minutes | HTTP 429 |
| Login | POST /auth/login | **5 attempts** | 15 minutes | HTTP 429 + security log |
| API | /api/* routes | 200 requests | 15 minutes | HTTP 429 + security log |

> Every breach is automatically logged to `logs/security.log` as a `BRUTE_FORCE_DETECTED` event — compatible with Fail2Ban monitoring.

---

### 2. CORS Policy — `cors`
Restricts API access to approved origins only:
```
Allowed: http://localhost:3000, http://127.0.0.1:3000
Blocked: Any other origin → HTTP 403 CORS Violation
```

---

### 3. Authentication — API Key + JWT

**API Key Authentication**
- Sent via `X-API-Key` request header
- Keys stored securely in `.env` file
- Invalid keys logged as `INVALID_API_KEY` security events

**JWT Bearer Token Authentication**
- Tokens issued on successful login (expire in 1 hour)
- Sent via `Authorization: Bearer <token>` header
- Expired/tampered tokens rejected with HTTP 401/403

**Dual Authentication (Admin routes)**
- Requires BOTH a valid API key AND a valid JWT token
- Plus role-based access control (admin role required)

---

### 4. Security Headers — `helmet`

Every response includes these protective headers:

| Header | Value | Protects Against |
|--------|-------|-----------------|
| `Content-Security-Policy` | `default-src 'self'` | XSS, script injection |
| `Strict-Transport-Security` | `max-age=31536000; includeSubDomains; preload` | Protocol downgrade attacks |
| `X-Frame-Options` | `DENY` | Clickjacking |
| `X-Content-Type-Options` | `nosniff` | MIME type sniffing |
| `Referrer-Policy` | `strict-origin-when-cross-origin` | Information leakage |
| `X-Powered-By` | *(removed)* | Technology fingerprinting |

---

### 5. Security Logging — `winston`

Three log files are automatically maintained:

```
logs/
├── security.log   ← All threat events (brute-force, invalid keys, JWT failures)
├── combined.log   ← All application events
└── error.log      ← Server errors only
```

Sample security log entry:
```
[2026-03-24 14:32:11] [WARN] BRUTE_FORCE_DETECTED | {"ip":"::1","email":"attacker@evil.com","alert":"Possible brute-force attack on /login"}
```

---

### 6. Intrusion Detection — Fail2Ban

The `config/fail2ban-jail.conf` file provides Fail2Ban configuration that reads from `security.log` and automatically bans IPs after repeated failed attempts.

```bash
# Setup on Linux
sudo apt install fail2ban -y
sudo cp config/fail2ban-jail.conf /etc/fail2ban/jail.local
sudo systemctl restart fail2ban
sudo fail2ban-client status nodejs-api
```

---

## 📁 Project Structure

```
dhc-cybersecurity-week4/
│
├── server.js                      # Main Express server (entry point)
├── package.json                   # Dependencies
├── .env                           # Environment variables (not committed)
├── .gitignore
│
├── config/
│   ├── logger.js                  # Winston logger — security + combined + error logs
│   ├── database.js                # SQLite with prepared statements (SQLi prevention)
│   └── fail2ban-jail.conf         # Fail2Ban intrusion detection config
│
├── middleware/
│   ├── rateLimiter.js             # express-rate-limit (global, login, API limiters)
│   ├── securityHeaders.js         # Helmet — CSP, HSTS, X-Frame-Options, noSniff
│   ├── corsConfig.js              # CORS — whitelist approved origins only
│   └── auth.js                   # API Key + JWT Bearer token authentication
│
├── routes/
│   ├── authRoutes.js              # POST /auth/signup, POST /auth/login
│   └── apiRoutes.js               # GET /api/health, /profile, /data, /admin
│
├── public/
│   └── index.html                 # Live security dashboard with API tester
│
└── logs/                          # Auto-generated (gitignored)
    ├── security.log
    ├── combined.log
    └── error.log
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js v18 or higher
- npm

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/JuttSahib1999/DHC_cyber-security-internship-week4.git

# 2. Navigate into the project
cd DHC_cyber-security-internship-week4

# 3. Install dependencies
npm install

# 4. Start the server
node server.js
```

### Access the Dashboard
Open your browser and navigate to:
```
http://localhost:3000
```

The live security dashboard loads with a built-in API tester for all endpoints.

---

## 📡 API Reference

| Method | Endpoint | Auth Required | Rate Limit | Description |
|--------|----------|--------------|------------|-------------|
| `GET` | `/api/health` | None | Global | Server health + security status |
| `GET` | `/api/headers-check` | None | Global | Security headers documentation |
| `POST` | `/auth/signup` | None | Global | Register new user account |
| `POST` | `/auth/login` | None | **5/15min** | Login → returns JWT token |
| `GET` | `/api/profile` | JWT Token | 200/15min | Authenticated user profile |
| `GET` | `/api/data` | API Key | 200/15min | API Key protected data |
| `GET` | `/api/admin` | API Key + JWT | 200/15min | Admin panel (admin role only) |

### Example Requests

**Login and get JWT token:**
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@dhc.com","password":"Admin@2026"}'
```

**Access JWT-protected route:**
```bash
curl http://localhost:3000/api/profile \
  -H "Authorization: Bearer <your-token-here>"
```

**Access API Key-protected route:**
```bash
curl http://localhost:3000/api/data \
  -H "X-API-Key: dhc-apikey-admin-001"
```

**Test rate limiting (run 6 times):**
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"wrong@test.com","password":"wrongpass"}'
```

---

## 🧪 Testing the Security Features

### Rate Limiting Test
1. Open `http://localhost:3000` in your browser
2. Scroll to **Test 2** on the dashboard
3. Click **Login** 6 times with wrong credentials
4. 6th attempt returns **HTTP 429 Too Many Login Attempts**

### Security Headers Test
1. Open `http://localhost:3000` in Chrome
2. Press `F12` → **Network** tab
3. Send Test 3 request on the dashboard
4. Click the request → **Response Headers**
5. Verify: `content-security-policy`, `strict-transport-security`, `x-frame-options`

### JWT Authentication Test
1. Use Test 4 on dashboard: login with `admin@dhc.com` / `Admin@2026`
2. Copy the JWT token from response
3. Use Test 5: access `/api/profile` with the token → **200 OK**
4. Clear the token and retry → **401 Unauthorized**

### API Key Test
1. Use Test 6 on dashboard
2. Send with `X-API-Key: dhc-apikey-admin-001` → **200 OK**
3. Send without the key → **401 Unauthorized**

---

## 🧱 Security Headers

Verify headers are active using this command:
```bash
curl -I http://localhost:3000/api/health
```

Expected output includes:
```
content-security-policy: default-src 'self'; ...
strict-transport-security: max-age=31536000; includeSubDomains; preload
x-frame-options: DENY
x-content-type-options: nosniff
referrer-policy: strict-origin-when-cross-origin
```

---

## 📊 Intrusion Detection & Logging

### View real-time security logs:
```bash
# Windows
type logs\security.log

# Mac / Linux
cat logs/security.log
# or watch in real-time:
tail -f logs/security.log
```

### Log event types:
| Event | Trigger | Severity |
|-------|---------|----------|
| `BRUTE_FORCE_DETECTED` | 5+ failed logins from same IP | WARN |
| `INVALID_API_KEY` | Request with wrong API key | WARN |
| `JWT_INVALID` | Tampered or expired token | WARN |
| `CORS_BLOCKED` | Request from unauthorized origin | WARN |
| `RATE_LIMIT_EXCEEDED_GLOBAL` | Too many requests globally | WARN |
| `LOGIN_SUCCESS` | Successful authentication | INFO |

---

## 📸 Screenshots

> Screenshots from testing are included in the `/screenshots` folder of the submission document.

| # | Screenshot | Description |
|---|-----------|-------------|
| 1 | Server Startup | Terminal showing all ✅ security features active |
| 2 | Dashboard | Live security dashboard at localhost:3000 |
| 3 | HTTP 429 | Rate limit triggered after 5 failed login attempts |
| 4 | Security Log | `security.log` showing BRUTE_FORCE_DETECTED entries |
| 5 | Security Headers | Browser DevTools showing CSP, HSTS, X-Frame-Options |
| 6 | JWT Login | Successful login response with token |
| 7 | JWT Profile | Protected route accessed with valid token |
| 8 | API Key Auth | Protected data with key (200) vs without key (401) |

---

## 🛠️ Technologies Used

| Package | Version | Purpose |
|---------|---------|---------|
| `express` | ^4.18.2 | Web server framework |
| `helmet` | ^7.1.0 | Security headers (CSP, HSTS, etc.) |
| `express-rate-limit` | ^7.2.0 | Rate limiting & brute-force protection |
| `cors` | ^2.8.5 | Cross-Origin Resource Sharing policy |
| `jsonwebtoken` | ^9.0.2 | JWT token generation & verification |
| `bcryptjs` | ^2.4.3 | Password hashing (12 rounds) |
| `sqlite3` | ^5.1.7 | Database with prepared statements |
| `validator` | ^13.12.0 | Input validation & sanitization |
| `winston` | ^3.11.0 | Security event logging |
| `dotenv` | ^16.4.5 | Environment variable management |

---

## 🔗 Related Repositories

| Week | Repository | Focus |
|------|-----------|-------|
| Week 1 | [DHC_cyber-security-internship-week1](https://github.com/JuttSahib1999/DHC_cyber-security-internship-week1) | Vulnerable app (SQL Injection, plain-text passwords) |
| Week 2 | [DHC_cyber-security-internship-week2](https://github.com/JuttSahib1999/DHC_cyber-security-internship-week2) | Security fixes (bcrypt, JWT, Helmet, parameterized queries) |
| **Week 4** | **This repository** | **Advanced security (Rate limiting, CORS, CSP, HSTS, Auth)** |

---

## ⚠️ Security Notes

- The `.env` file is **gitignored** — never commit real secrets to GitHub
- The `logs/` directory is **gitignored** — log files stay local
- The `database.db` is **gitignored** — database stays local
- All SQL queries use **prepared statements** — no SQL injection possible
- Passwords are hashed with **bcrypt (12 rounds)** — never stored in plain text

---

<div align="center">

© 2026 Abdul Muqeet Tabraiz &nbsp;|&nbsp; DHC Cybersecurity Internship

⭐ If this project helped you, please give it a star!

</div>
