# 🚀 Arab Kids Code — Full-Stack Educational Platform (كود أطفال العرب)

> Production-ready, secure, scalable, fully Arabic (RTL) educational platform that teaches programming (Scratch and game design) to children aged 6–14.
> **Instructor:** Eng. Mustafa Atta (م. مصطفى عطا) — WhatsApp/Phone: +201101587881

---

## 🛠️ Technology Stack

- **Frontend (`apps/web`):** React 18, TypeScript, Vite, React Router, TanStack Query, Zustand, Tailwind CSS (RTL), Framer Motion, i18next, React Hook Form, Zod.
- **Backend (`apps/api`):** Node.js 20 LTS, Express, TypeScript, Mongoose (MongoDB Atlas), Redis, Zod, JWT (httpOnly Cookies), Pino logging.
- **Shared Package (`packages/shared`):** Shared Zod schemas, TypeScript types, constants & DTOs.
- **Infrastructure:** Docker, Docker Compose, Nginx, GitHub Actions CI/CD.

---

## 📂 Monorepo Structure

```
arab-kids-code/
├─ apps/
│  ├─ web/                # React + Vite (RTL UI)
│  └─ api/                # Express REST API (/api/v1)
├─ packages/
│  └─ shared/             # Shared Zod schemas, types, constants
├─ infra/                 # Dockerfiles, Nginx configs, GitHub Actions workflows
├─ docs/                  # System Architecture, API Spec, Security & Runbook
├─ docker-compose.yml
├─ .env.example
└─ README.md
```

---

## ⚡ Quick Start

### 1. Install Workspace Dependencies
```bash
npm install
```

### 2. Build Shared Package
```bash
npm run build:shared
```

### 3. Run Environment Services with Docker
```bash
docker compose up -d mongo redis mailhog
```

### 4. Start Development Servers
```bash
# Run both API & Web concurrently
npm run dev

# Or start individually:
npm run dev:api
npm run dev:web
```

---

## 🚦 Phase Roadmap

- [x] **Phase 1 — Foundation:** Monorepo architecture, TypeScript configs, ESLint/Prettier/Husky, Docker Compose, CI skeleton, `.env.example`, README.
- [x] **Phase 2 — Backend Core:** Mongoose models, authentication, RBAC middleware, Swagger docs, seed scripts.
- [x] **Phase 3 — Content & Progress:** Lessons API, server-side unlock enforcement, quizzes, submissions.
- [x] **Phase 4 — Frontend Public Site:** Arabic landing page, free lesson, curriculum, testimonials, contact form.
- [x] **Phase 5 — Student & Parent Apps:** Dashboards, Scratch player, child switcher, reports.
- [x] **Phase 6 — Teacher Dashboard:** Admin analytics, family CRUD, review moderation, subscriptions.
- [x] **Phase 7 — Billing & Notifications:** Paymob/Fawry payments, email templates, parent reports.
- [x] **Phase 8 — Hardening:** Security audit, rate limits, performance, accessibility (WCAG 2.1 AA) & automated tests.
- [x] **Phase 9 — Deployment:** Production Docker images, Nginx caching, SSL readiness, backup runbooks.
- [x] **Phase 10 — Migration:** Legacy prototype asset migration, data migration scripts & 301 URL redirects.
