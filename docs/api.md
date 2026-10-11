# Arab Kids Code — API Specification Blueprint

## REST API Overview (`/api/v1`)

### Authentication & Authorization
- `POST /api/v1/auth/login` — Authenticate user, set secure httpOnly refresh cookie & return access token.
- `POST /api/v1/auth/refresh` — Rotate refresh token & issue new access token.
- `POST /api/v1/auth/logout` — Revoke refresh token & clear cookie.
- `GET  /api/v1/auth/me` — Fetch current user profile & role capabilities.
- `POST /api/v1/auth/forgot-password` — Initiate password reset email/SMS flow.
- `POST /api/v1/auth/reset-password` — Reset password using token.

### Public Endpoints
- `GET  /api/v1/public/course` — Public course info, statistics & curriculum overview.
- `GET  /api/v1/public/lessons/free` — Retrieve free lesson details (Lesson 1).
- `GET  /api/v1/public/reviews` — Fetch teacher-approved reviews & star ratings.
- `POST /api/v1/public/reviews` — Submit new review (pending teacher moderation).
- `POST /api/v1/public/contact` — Contact form submission to Eng. Mustafa Atta.

### Student & Parent Routes
- `GET  /api/v1/me/children` — Parent route to get all linked student profiles.
- `GET  /api/v1/lessons` — List all lessons with server-enforced `isUnlocked` status.
- `GET  /api/v1/lessons/:id` — Get lesson details (signed video URL generated if unlocked).
- `POST /api/v1/lessons/:id/progress` — Record watched seconds & completion status.
- `POST /api/v1/lessons/:id/quiz` — Submit quiz answers & calculate score/XP.
- `POST /api/v1/lessons/:id/submission` — Submit Scratch project link or project file.

### Billing & Subscriptions
- `POST /api/v1/billing/checkout` — Initiate Paymob / Fawry payment session.
- `POST /api/v1/billing/webhook/:provider` — Verified signature payment webhook callback.
- `GET  /api/v1/billing/history` — Payment invoices & active subscription status.

### Admin / Teacher Portal
- `GET  /api/v1/admin/analytics` — Platform metrics, active subscribers, revenue, drop-off rates.
- `GET  /api/v1/admin/students` — Management list of students with parent links.
- `PATCH /api/v1/admin/reviews/:id` — Approve or reject pending user reviews.
- `POST /api/v1/admin/subscriptions` — Manual subscription activation or extension.
