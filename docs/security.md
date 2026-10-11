# Arab Kids Code — Security Policy & COPPA Compliance

## Child Data Privacy & Protection
1. **Minimum Necessary Data:** Only collect display name, parent contact details, and progress data for kids. No social chat, public profiles, or open interaction between students.
2. **Parental Consent:** Parental consent recorded before activating any child account, stored with policy version & IP timestamp (`consents` collection).
3. **Password Security:** Server-side bcrypt/argon2 password hashing with strict minimum strength policies. Mandatory password change for default teacher accounts on first login.
4. **Video Content Protection:** Signed, expiring video URLs generated via server API. No public video asset URLs exposed in frontend bundles.

## OWASP Top 10 Safeguards
- **Injection:** Mongoose sanitization (`mongo-sanitize`), Zod strict request payload validation.
- **Access Control:** Server-side RBAC middleware and explicit parent-child ownership verification on every route.
- **CSRF & XSS:** `SameSite=Strict` cookies, Helmet headers, DOMPurify for HTML content.
- **Rate Limiting:** Redis-backed rate limiting per IP and route group (strict on login & review endpoints).
