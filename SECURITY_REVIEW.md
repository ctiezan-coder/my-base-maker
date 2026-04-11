# Security Review - ACIEX (Base de Données Institutionnelle)

**Date:** 2026-04-11  
**Scope:** Full codebase security audit  
**Stack:** React 18 + TypeScript + Vite (frontend), Supabase + Deno Edge Functions (backend)

---

## Summary

ACIEX is a multi-user institutional database management platform for Côte d'Ivoire Export. It manages companies, events, projects, trainings, market opportunities, and more. The application has reasonable security foundations (Supabase Auth, parameterized queries, Zod validation, RBAC), but several critical and high-severity issues require immediate attention.

| Severity | Count |
|----------|-------|
| CRITICAL | 2     |
| HIGH     | 3     |
| MEDIUM   | 8     |
| LOW      | 3     |

---

## CRITICAL Findings

### SEC-01: Supabase Credentials Committed to Git History

**File:** `.env`  
**Commit:** `311993f`

The `.env` file containing Supabase project credentials was committed to the repository:

```
VITE_SUPABASE_PROJECT_ID="abbxntdwuvduagjtlyri"
VITE_SUPABASE_PUBLISHABLE_KEY="eyJhbGciOiJIUzI1NiIs..."
VITE_SUPABASE_URL="https://abbxntdwuvduagjtlyri.supabase.co"
```

Although `.env` is now listed in `.gitignore`, the file and credentials remain in git history. The anon key, project ID, and URL fully identify the Supabase instance.

**Impact:** Anyone with repository access can extract these credentials from git history.

**Remediation:**
1. Rotate all Supabase keys immediately (anon key, service role key)
2. Remove `.env` from git history using `git filter-repo` or BFG Repo Cleaner
3. Verify `.env` remains in `.gitignore`

---

### SEC-02: External Service Authentication via Email/Password

**File:** `supabase/functions/sync-external-formations/index.ts:11-17`

```typescript
async function getExternalJWT(): Promise<string> {
  const email = Deno.env.get('EXTERNAL_AUTH_EMAIL')
  const password = Deno.env.get('EXTERNAL_AUTH_PASSWORD')
  // ...authenticates via password grant
}
```

The function authenticates to an external Supabase instance using email/password credentials stored in environment variables. This is a weak authentication pattern for service-to-service communication.

**Impact:** Compromised environment variables expose the external system. Password-based auth lacks rotation capabilities and audit trail.

**Remediation:**
- Use service role keys or OAuth2 client credentials for backend-to-backend auth
- Implement short-lived tokens with automatic rotation
- Never store plaintext passwords in environment variables

---

## HIGH Findings

### SEC-03: CORS Defaults to Wildcard Origin

**Files:** All Edge Functions (`supabase/functions/*/index.ts`)

```typescript
const corsHeaders = {
  'Access-Control-Allow-Origin': Deno.env.get('ALLOWED_ORIGIN') || '*',
  // ...
}
```

Every Edge Function defaults to `Access-Control-Allow-Origin: *` if `ALLOWED_ORIGIN` is not set. This allows any website to make authenticated requests to the API.

**Impact:** Cross-origin attacks can target authenticated users if the env var is missing or misconfigured.

**Remediation:**
- Remove the `|| '*'` fallback — fail closed if `ALLOWED_ORIGIN` is not configured
- Set explicit allowed origins in production (e.g., `https://aciex.cotedivoirexport.ci`)

---

### SEC-04: No File Upload Type Validation

**Files:**
- `src/components/documents/FileUploadDialog.tsx`
- `src/components/mediatheque/MediaUploadDialog.tsx`

File uploads extract the extension via `fileName.split('.').pop()` but perform no MIME type validation, no file content inspection, and enforce no maximum file size at the application level.

**Impact:** Users could upload executable files, HTML files (stored XSS), or excessively large files (resource exhaustion).

**Remediation:**
- Implement a MIME type allowlist (e.g., PDF, DOCX, XLSX, PNG, JPG)
- Validate file content matches the declared extension
- Enforce maximum file size limits (e.g., 50MB for documents, 100MB for media)
- Configure Supabase Storage policies to restrict file types

---

### SEC-05: Inconsistent Password Validation in `create-admin-user`

**File:** `supabase/functions/create-admin-user/index.ts:51`

```typescript
const { email, password, fullName, directionId } = await req.json();
// No password validation — directly passed to createUser
```

The `create-admin-user` function accepts any password without validation. Compare with:
- `create-user` (line 12): validates `min(8)` only — missing uppercase/lowercase/digit checks
- `admin-reset-password`: full validation (8+ chars, uppercase, lowercase, digit)
- `Auth.tsx` (frontend): full validation

**Impact:** Admin accounts can be created with weak passwords (e.g., "a"), bypassing the password policy enforced elsewhere.

**Remediation:**
- Add consistent Zod password validation to all Edge Functions:
  ```typescript
  password: z.string().min(8).regex(/[A-Z]/).regex(/[a-z]/).regex(/[0-9]/)
  ```
- Extract shared validation schema to a common module

---

## MEDIUM Findings

### SEC-06: Session Tokens Stored in localStorage

**File:** `src/integrations/supabase/client.ts:12-16`

```typescript
auth: {
  storage: localStorage,
  persistSession: true,
  autoRefreshToken: true,
}
```

JWT session tokens are stored in `localStorage`, which is accessible to any JavaScript running on the page. Combined with the absence of Content Security Policy headers, this increases XSS impact.

**Remediation:**
- Add Content Security Policy headers to mitigate XSS
- Consider using `sessionStorage` or secure httpOnly cookies if the architecture supports it

---

### SEC-07: No Request Input Validation in `create-admin-user`

**File:** `supabase/functions/create-admin-user/index.ts:51`

```typescript
const { email, password, fullName, directionId } = await req.json();
```

Raw destructuring with no Zod validation. Compare with `create-user` which uses a proper Zod schema. The `email`, `fullName`, and `directionId` fields accept arbitrary strings.

**Remediation:**
- Add a Zod validation schema matching the one in `create-user`

---

### SEC-08: No Rate Limiting on Edge Functions

**Files:** All Edge Functions

None of the Edge Functions implement rate limiting. Admin operations (user creation, password reset, data sync) can be called without throttling.

**Impact:** Brute-force attacks on authentication, resource exhaustion, and API abuse.

**Remediation:**
- Implement rate limiting at the Supabase or reverse proxy level
- Add per-IP and per-user rate limits on sensitive endpoints

---

### SEC-09: Missing Security Headers

No Content-Security-Policy, X-Frame-Options, X-Content-Type-Options, or Strict-Transport-Security headers are configured in the application.

**Remediation:**
- Configure security headers in the deployment platform (e.g., Netlify `_headers`, Vercel `vercel.json`, or Vite plugin)
- Minimum recommended headers:
  ```
  Content-Security-Policy: default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'
  X-Frame-Options: DENY
  X-Content-Type-Options: nosniff
  Strict-Transport-Security: max-age=31536000; includeSubDomains
  ```

---

### SEC-10: Unvalidated External API Responses in `update-market-data`

**File:** `supabase/functions/update-market-data/index.ts:157-184`

```typescript
const marketsContent = JSON.parse(marketsData.choices[0].message.content)
// Data inserted directly into database without validation
```

LLM-generated JSON from the Lovable AI Gateway is parsed and inserted directly into the database without schema validation. The LLM could produce malformed data, unexpected types, or injection payloads.

**Impact:** Database corruption, unexpected application behavior, or potential injection if data is rendered without sanitization.

**Remediation:**
- Validate all LLM responses against a Zod schema before database insertion
- Implement a try/catch around JSON parsing with proper error handling
- Add data sanitization for string fields

---

### SEC-11: Console Logging of Sensitive Data in Production

**Files:**
- `supabase/functions/sync-external-formations/index.ts:107-113`
- `supabase/functions/update-market-data/index.ts:86`

```typescript
console.log('Sample participant data:', JSON.stringify(participants[0]))
console.log('Admin user authenticated:', user.email)
```

Participant PII and admin email addresses are logged to console in production Edge Functions.

**Impact:** Sensitive data exposed in Supabase function logs, accessible to anyone with project dashboard access.

**Remediation:**
- Remove or gate verbose logging behind a `DEBUG` environment variable
- Never log PII (emails, names, phone numbers) in production

---

### SEC-12: Fake Government ID Generation in Bulk Import

**File:** `src/components/companies/BulkImportDialog.tsx`

Bulk-imported companies receive generated fake RCCM numbers (e.g., `RCCM-IMP-{hash}`) using a non-cryptographic hash function. These look like legitimate government registration numbers.

**Impact:** Data integrity issues — fake IDs could be confused with real government-issued identifiers, creating compliance and legal risks.

**Remediation:**
- Use a clearly distinguishable prefix (e.g., `PENDING-IMPORT-{uuid}`)
- Flag imported records as "unverified" with a visible indicator in the UI
- Require manual verification of RCCM numbers for imported companies

---

### SEC-13: No Brute-Force Protection on Login

**File:** `src/pages/Auth.tsx`

The login form has no visible client-side or server-side rate limiting for failed authentication attempts.

**Impact:** Attackers can attempt unlimited password guesses against known email addresses.

**Remediation:**
- Implement account lockout after N failed attempts (e.g., 5 attempts then 15-minute lockout)
- Add CAPTCHA after repeated failures
- Configure Supabase Auth rate limiting settings

---

## LOW Findings

### SEC-14: Outdated Supabase Client Versions in Edge Functions

Edge Functions use different versions of `@supabase/supabase-js`:
- `create-user`: `@2.7.1`
- `update-market-data`: `@2.39.3`
- `create-admin-user`: `@2.77.0`

**Remediation:** Standardize all Edge Functions to the latest stable version.

---

### SEC-15: No Multi-Factor Authentication (MFA)

The application relies solely on email/password authentication with no option for MFA/2FA.

**Remediation:** Enable Supabase Auth MFA (TOTP) for admin and manager accounts at minimum.

---

### SEC-16: PII Stored in Plaintext

Sensitive personal data (phone numbers, email addresses, physical addresses) is stored in plaintext in the database without field-level encryption.

**Remediation:**
- Classify data by sensitivity level
- Consider field-level encryption for high-sensitivity PII using Supabase Vault
- Implement data retention and deletion policies for GDPR/data protection compliance

---

## Positive Findings

The following security controls are well-implemented:

1. **Role-Based Access Control (RBAC):** Proper 3-tier role hierarchy (admin > manager > user) with database-backed permissions and module-level access control
2. **Email Domain Restriction:** Both client-side (Zod) and server-side (`is_email_allowed` RPC) validation restricts registration to `@cotedivoirexport.ci`
3. **Parameterized Queries:** All database access uses the Supabase client library — no raw SQL queries found
4. **XSS Prevention:** React's default JSX sanitization is used throughout; no `dangerouslySetInnerHTML` or `innerHTML` usage found
5. **Admin Verification:** All Edge Functions verify admin role before executing privileged operations
6. **User Deletion Safety:** The `delete-user` function preserves data integrity by nullifying `created_by` references across 15+ tables
7. **Password Policy (Frontend):** Strong password requirements enforced with Zod (8+ chars, uppercase, lowercase, digit)
8. **Input Validation (Company Data):** Comprehensive Zod schema with length limits, format validation, and enum constraints

---

## Recommended Priority Actions

### Immediate (This Week)
- [ ] Rotate Supabase keys (SEC-01)
- [ ] Remove `.env` from git history (SEC-01)
- [ ] Set explicit `ALLOWED_ORIGIN` on all Edge Functions, remove `*` fallback (SEC-03)
- [ ] Add password validation to `create-admin-user` and `create-user` (SEC-05)
- [ ] Add input validation (Zod schema) to `create-admin-user` (SEC-07)

### Short-term (This Month)
- [ ] Add file upload type/size validation (SEC-04)
- [ ] Configure security headers (SEC-09)
- [ ] Validate LLM responses before DB insertion (SEC-10)
- [ ] Remove PII from production logs (SEC-11)
- [ ] Implement rate limiting (SEC-08)
- [ ] Replace external email/password auth with service keys (SEC-02)

### Medium-term (Next Quarter)
- [ ] Add brute-force protection (SEC-13)
- [ ] Enable MFA for privileged accounts (SEC-15)
- [ ] Standardize Supabase client versions (SEC-14)
- [ ] Fix fake government ID generation (SEC-12)
- [ ] Implement CSP and move tokens to secure storage (SEC-06)
- [ ] Encrypt PII at rest (SEC-16)
