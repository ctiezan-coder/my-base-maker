# Security Review - ACIEX Platform

**Date**: 2026-04-11
**Application**: ACIEX - Centralized institutional database (React + Supabase)
**Reviewer**: Automated Security Audit

---

## Executive Summary

This review identified **8 critical**, **6 high**, and **5 medium** severity issues across the ACIEX application. The most urgent findings involve exposed credentials in git history, an unauthenticated database write endpoint, overly permissive CORS, and missing route guards. Immediate remediation is recommended for critical items.

---

## CRITICAL Severity

### 1. `.env` file with Supabase credentials committed to Git history

**File**: `.env` (committed in `311993f`)
**Risk**: Full compromise of Supabase backend

The `.env` file contains real Supabase project credentials (URL, publishable key, project ID) and has been committed to git history. Although `.gitignore` now lists `.env`, the credentials remain in the git history and are recoverable.

**Impact**: Anyone with repository access can extract the Supabase anon key and URL, enabling direct API calls to the database backend.

**Remediation**:
- Rotate all Supabase keys immediately (anon key, service role key)
- Use `git filter-branch` or `BFG Repo-Cleaner` to scrub `.env` from history
- Ensure `.env` never gets re-committed

---

### 2. Unauthenticated anonymous INSERT on `companies` table

**File**: `supabase/migrations/20260323095146_d252e551-8875-477d-9e81-06e0f38f8be4.sql`
**Risk**: Data pollution, spam, denial of service

```sql
CREATE POLICY "Allow anonymous inserts for PME registration"
ON public.companies FOR INSERT TO anon WITH CHECK (true);
```

The PME Registration page (`src/pages/PmeRegistration.tsx`) allows unauthenticated users to insert rows into the `companies` table with no rate limiting, CAPTCHA, or input validation beyond requiring 3 fields. Any bot or attacker can flood the companies table with garbage data.

**Impact**: Database pollution, storage exhaustion, and data integrity compromise.

**Remediation**:
- Replace anonymous inserts with a Supabase Edge Function that includes rate limiting and CAPTCHA validation
- Or require authentication before PME registration
- Add server-side input validation and length constraints

---

### 3. CORS wildcard fallback on all Edge Functions

**Files**: All 8 files in `supabase/functions/*/index.ts`
**Risk**: Cross-origin attacks against admin operations

```typescript
'Access-Control-Allow-Origin': Deno.env.get('ALLOWED_ORIGIN') || '*'
```

If `ALLOWED_ORIGIN` is not configured (which is common in development), all Edge Functions accept requests from any origin. This includes sensitive admin operations like `create-user`, `delete-user`, `admin-reset-password`, and `emergency-reset`.

**Impact**: A malicious website could perform admin operations on behalf of an authenticated admin via CSRF-like attacks.

**Remediation**:
- Set `ALLOWED_ORIGIN` explicitly in Supabase Edge Function secrets
- Remove the `|| '*'` fallback; fail closed if the variable is not set
- Add the `Vary: Origin` header

---

### 4. `create-admin-user` function lacks input validation

**File**: `supabase/functions/create-admin-user/index.ts:51`
**Risk**: Privilege escalation, weak account creation

```typescript
const { email, password, fullName, directionId } = await req.json();
```

Unlike `create-user` which uses Zod validation, `create-admin-user` accepts raw unvalidated input. No email format check, no password strength requirements, no field length limits. It also always assigns the `admin` role regardless of the caller's intent.

**Impact**: An admin could accidentally create admin accounts with weak passwords or malformed data.

**Remediation**:
- Add Zod schema validation matching `create-user`
- Enforce strong password policy (min 8 chars, uppercase, lowercase, digit)
- Validate email format and field lengths

---

### 5. `admin-reset-password` function has weaker password validation than `reset-password`

**Files**: `supabase/functions/admin-reset-password/index.ts:32` vs `supabase/functions/reset-password/index.ts:61`
**Risk**: Weak passwords set via admin reset

The `admin-reset-password` only checks `newPassword.length < 8`, while `reset-password` properly validates uppercase, lowercase, and digit requirements. This inconsistency allows admins to set weak passwords that bypass the intended policy.

**Remediation**:
- Unify password validation across all functions using a shared schema
- Enforce: min 8 chars + uppercase + lowercase + digit everywhere

---

### 6. SQL export file publicly accessible

**File**: `public/database-export.sql`
**Risk**: Information disclosure

A full SQL dump with real data (directions, partnerships, trainings, business connections, folder structure, plus comments indicating profile data) is served as a static asset. Anyone can access it at `https://<domain>/database-export.sql`.

**Impact**: Exposes organizational structure, business data, partner contacts (including personal emails and phone numbers), and database schema.

**Remediation**:
- Remove `public/database-export.sql` immediately
- Never place database exports in the `public/` directory
- Add to `.gitignore`: `*.sql` under `public/`

---

### 7. `emergency-reset` function exists without audit logging

**File**: `supabase/functions/emergency-reset/index.ts`
**Risk**: Undetected system manipulation

An emergency reset function exists that can perform dangerous operations. While it requires admin auth, there is no audit trail or notification when it is invoked.

**Remediation**:
- Add audit logging for all emergency operations
- Send email notifications to all admins when triggered
- Consider requiring multi-admin approval

---

### 8. `delete-user` function uses Service Role Key for data cleanup but doesn't verify self-deletion prevention

**File**: `supabase/functions/delete-user/index.ts`
**Risk**: Admin can delete their own account, leaving the system without admins

There is no check preventing an admin from deleting their own user ID. The service role key is used to null out `created_by` across 15+ tables before deletion.

**Remediation**:
- Add a check: `if (userId === user.id) return 403`
- Verify at least one admin remains after deletion

---

## HIGH Severity

### 9. No route-level authentication guards

**File**: `src/App.tsx:59-89`
**Risk**: Unauthorized access to protected pages

Routes are defined without any authentication wrapper component. The `Dashboard` component checks auth via `useEffect` and redirects, but there is a race condition window where the page renders before the redirect fires. Individual pages within `/dashboard/*` have no additional auth checks.

**Remediation**:
- Create a `ProtectedRoute` wrapper component
- Use it to guard all `/dashboard/*` routes at the router level
- Render a loading spinner until auth state is resolved

---

### 10. Client-side-only authorization checks

**Files**: `src/pages/DatabaseExport.tsx:17-25`, `src/pages/Admin.tsx`, `src/pages/UserPermissions.tsx`
**Risk**: Authorization bypass

Admin-only pages check `useUserRole()` on the client and redirect if not admin. This is trivially bypassable - a user can modify JavaScript in the browser, or call Supabase APIs directly. The actual data protection depends entirely on RLS policies.

**Remediation**:
- Ensure every sensitive operation is protected by RLS policies server-side
- Audit all tables to verify admin-only operations require admin role in RLS
- Client-side checks should be treated as UX only, never security

---

### 11. Dependency vulnerabilities: 16 known vulnerabilities (10 high)

**Tool**: `npm audit`
**Risk**: Known exploits in dependencies

Key vulnerable packages:
- **react-router-dom 6.30.1** - XSS via open redirects (HIGH)
- **xlsx 0.18.5** - Prototype pollution + ReDoS (HIGH, no fix available)
- **vite/esbuild** - Dev server request hijacking (MODERATE)
- **lodash** - Prototype pollution (HIGH)
- **flatted** - Unbounded recursion DoS + prototype pollution (HIGH)

**Remediation**:
- Run `npm audit fix` for fixable issues
- Replace `xlsx` with `SheetJS Community Edition` or `exceljs`
- Update `react-router-dom` to v7+

---

### 12. Inconsistent Supabase client library versions in Edge Functions

**Files**: Multiple `supabase/functions/*/index.ts`
**Risk**: Inconsistent security patches

Edge Functions use 4 different versions of `@supabase/supabase-js`:
- `@2.7.1` (create-user, delete-user)
- `@2.77.0` (create-admin-user, admin-reset-password, reset-password, emergency-reset)
- `@2.39.3` (update-market-data)
- `@2` (sync-external-formations)

**Remediation**:
- Standardize all Edge Functions to the latest version
- Pin exact versions for reproducible builds

---

### 13. Chat messages query filter uses unsanitized user IDs in `.or()` clause

**File**: `src/hooks/useChatMessages.ts:40`
**Risk**: PostgREST filter injection

```typescript
.or(`sender_id.eq.${user.id},receiver_ids.cs.{${user.id}}`)
```

While `user.id` comes from the authenticated session (UUID format), using string interpolation in PostgREST filter expressions is a dangerous pattern. If any code path allows a non-UUID value, it could manipulate the filter.

**Remediation**:
- Use parameterized queries or Supabase's filter builder methods
- Validate that `user.id` is always a UUID before interpolation

---

### 14. `update-market-data` function inserts AI-generated data without validation

**File**: `supabase/functions/update-market-data/index.ts:158-310`
**Risk**: Data integrity, prompt injection

The function sends prompts to an AI API and directly inserts the parsed JSON response into the database without validating field values, types, or ranges. A prompt injection or malformed API response could insert malicious or nonsensical data.

**Remediation**:
- Validate AI responses against a Zod schema before insertion
- Set reasonable bounds on numeric fields
- Sanitize text fields

---

## MEDIUM Severity

### 15. Excessive `console.log` statements in production code

**Files**: 50+ files, 260+ occurrences
**Risk**: Information leakage

Hundreds of `console.log`, `console.error`, and `console.warn` statements exist including data payloads, error details, and debugging information. These are visible in browser DevTools.

Examples:
- `console.log('Directions loaded:', data)` (Auth.tsx:79)
- `console.log('Sample participant data:', JSON.stringify(participants[0]))` (sync-external-formations:113)

**Remediation**:
- Remove all `console.log` statements or use a logging library with level control
- Never log sensitive data (user profiles, tokens, full payloads)

---

### 16. `sanitizeFilterValue` strips characters but doesn't escape them

**File**: `src/lib/utils.ts:12-14`
**Risk**: Incomplete protection

```typescript
export function sanitizeFilterValue(value: string): string {
  return value.replace(/[,.()"\\*]/g, '');
}
```

The function removes special characters rather than escaping them. While this prevents injection, it also silently alters search terms (e.g., "Inc." becomes "Inc"). It also misses some PostgREST-relevant characters.

**Remediation**:
- Document the behavior explicitly
- Consider URL-encoding or properly escaping instead of stripping

---

### 17. `sectorFilter` in `MarketDevelopment.tsx` not sanitized

**File**: `src/pages/MarketDevelopment.tsx:70`
**Risk**: PostgREST filter manipulation

```typescript
query = query.ilike("sector", sectorFilter);
```

The `sectorFilter` value comes from user-selectable options but is passed directly to `ilike()` without sanitization. While the select options limit the input in the UI, the Supabase query could be called with arbitrary values via browser DevTools.

**Remediation**:
- Validate `sectorFilter` against the allowed list before using in queries
- Apply `sanitizeFilterValue()` as a defense-in-depth measure

---

### 18. `survey_responses` allows anonymous inserts

**File**: `supabase/migrations/20260107144712_e8666a8d-e7e1-4011-9506-10b5dd7fb877.sql:289`
**Risk**: Survey spam and data pollution

```sql
CREATE POLICY "Anyone can submit survey_responses" ON public.survey_responses
FOR INSERT TO authenticated, anon WITH CHECK (true);
```

**Remediation**:
- Add rate limiting or CAPTCHA for anonymous submissions
- Consider restricting to authenticated users only

---

### 19. Sample import file in public directory

**File**: `public/sample-import.xlsx`
**Risk**: Minor information disclosure

A sample Excel import template is publicly accessible. While likely not containing real data, it reveals the expected data format and column structure.

**Remediation**:
- Serve behind authentication or move to a protected storage location

---

## Positive Security Findings

The following security practices are already well-implemented:

1. **Password policy enforcement** on signup with uppercase, lowercase, digit requirements
2. **Email domain restriction** (`@cotedivoirexport.ci` only) on registration
3. **Email whitelist check** via `is_email_allowed` RPC before signup
4. **Account approval workflow** - new accounts require admin approval
5. **Environment variable validation** using Zod schemas (`src/lib/env.ts`)
6. **HTTPS enforcement** for Supabase URL validation
7. **Row Level Security** enabled on most tables with direction-scoped access
8. **Module-based permission system** with granular role assignments
9. **Admin verification** on all Edge Functions (auth header + role check)
10. **PostgREST filter sanitization** applied in search queries
11. **No direct `innerHTML` usage** in custom code
12. **No `eval()` or `Function()` usage**
13. **Auto token refresh** enabled for session management

---

## Prioritized Remediation Plan

| Priority | Item | Effort |
|----------|------|--------|
| P0 | Rotate Supabase keys & scrub .env from git history | 1 hour |
| P0 | Remove `public/database-export.sql` | 5 minutes |
| P0 | Fix CORS wildcard fallback on Edge Functions | 30 minutes |
| P1 | Add rate limiting/CAPTCHA to PME registration | 2-4 hours |
| P1 | Add `ProtectedRoute` wrapper for authenticated routes | 1-2 hours |
| P1 | Add Zod validation to `create-admin-user` function | 30 minutes |
| P1 | Unify password validation across Edge Functions | 1 hour |
| P1 | Run `npm audit fix` and replace `xlsx` library | 1-2 hours |
| P2 | Standardize Supabase SDK versions in Edge Functions | 30 minutes |
| P2 | Add AI response validation in `update-market-data` | 1 hour |
| P2 | Add audit logging to `emergency-reset` | 1 hour |
| P2 | Add self-deletion prevention in `delete-user` | 15 minutes |
| P3 | Remove console.log from production code | 2 hours |
| P3 | Fix `sectorFilter` sanitization | 15 minutes |
| P3 | Move sample-import.xlsx behind auth | 15 minutes |
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
