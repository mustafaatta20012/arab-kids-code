# Arab Kids Code (كود أطفال العرب) — Operational Runbook & Deployment Guide

## 1. Quick Start (Development)
```bash
# 1. Install root & workspace dependencies
npm install

# 2. Build shared package
npm run build:shared

# 3. Spin up backing services (MongoDB, Redis, MailHog)
docker compose up -d mongo redis mailhog

# 4. Seed initial database (Teacher account, 30 Scratch lessons, demo family)
npm run seed

# 5. Start development servers concurrently
npm run dev
# Web available at: http://localhost:3000
# API available at: http://localhost:5000
# API Swagger Docs: http://localhost:5000/api/v1/docs
# MailHog GUI:      http://localhost:8025
```

---

## 2. One-Command Production Docker Deployment
```bash
# Build and run all services in production mode
docker compose up --build -d
```

---

## 3. Database Maintenance & Migration
```bash
# Seed initial content
npm run seed

# Run legacy prototype migration (idempotently imports reviews & sets up courses)
npm run migrate

# Manual MongoDB Snapshot Backup
mongodump --uri="$MONGODB_URI" --out=/backups/$(date +%F)
```

---

## 4. Test Suite Verification
```bash
# Run unit, integration, and security tests across workspaces
npm run test

# Run TypeScript compilation and build check
npm run build
```

---

## 5. Security & Hardening Configuration
- **Rate Limiting**: General API (300 req / 15 min), Auth (10 req / 15 min), Billing (20 req / 15 min).
- **Security Headers**: Helmet with Content Security Policy permitting MIT Scratch (`https://scratch.mit.edu`), Google Fonts (`https://fonts.googleapis.com`), and Paymob iframes (`https://accept.paymob.com`).
- **NoSQL Injection**: Built-in recursive sanitization stripping any `$` operator keys.
- **Structured Logging**: Pino structured logger emitting correlation IDs (`X-Request-Id`) on every HTTP request.
- **Legacy URL Redirection**: Nginx and React Router redirect `/lesson1.html` -> `/lessons/free` and `/lesson*.html` -> `/curriculum`.
