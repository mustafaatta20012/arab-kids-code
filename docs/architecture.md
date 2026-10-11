# Arab Kids Code — Architecture Blueprint

## System Overview
"Arab Kids Code" (كود أطفال العرب) is a full-stack, production-grade educational platform built to teach programming (Scratch & Game Design) to children aged 6–14.

### Monorepo Architecture
```
arab-kids-code/
├── apps/
│   ├── web/        # React 18 + Vite + TypeScript + Tailwind CSS (RTL) + i18next + PWA
│   └── api/        # Node.js 20 + Express + TypeScript + Mongoose + Redis + BullMQ
├── packages/
│   └── shared/     # Shared Zod schemas, TypeScript types, constants & DTOs
├── docs/           # System, API, Security & Operations documentation
└── infra/          # Docker compose, Nginx, CI/CD GitHub workflows
```

## Security & Access Model
- **Auth Tokens:** Short-lived JWT Access Tokens (15 min) + Rotating Refresh Tokens stored in `httpOnly; Secure; SameSite=Strict` cookies.
- **RBAC Matrix:** Server-enforced roles (`visitor`, `student`, `parent`, `teacher`, `super_admin`).
- **Data Protection:** No browser-side password hashing. Minimum PII collection for children.

## Data Flows
1. **Parent Onboarding:** Signup -> Phone/Email Verification -> Create Child Profiles -> Choose Plan -> Paymob/Fawry Webhook -> Activate Subscription.
2. **Child Learning:** Student Login -> Dashboard -> Server Validates Unlocked Lesson -> Streams/Renders Video & Scratch Embed -> Submit Project / Complete Quiz -> Update XP & Badges.
3. **Teacher Management:** Manage Families, Link Children, Review Submissions, Moderating Reviews, Analytics.
