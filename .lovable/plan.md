
## Context

Your repo `nextgen-health-doc-cms` is split into:
- `backend/` — Python FastAPI + Postgres (stays in your repo, untouched)
- `frontend/` — React + TinyMCE (we'll rebuild this here, cleaner and prettier)

Lovable can't import the repo directly, so we scaffold a fresh frontend that talks to your existing FastAPI over HTTP. Once it's ready, you connect this Lovable project to a new GitHub repo (or paste the `frontend/` folder back into your monorepo).

No Lovable Cloud — auth and storage both live on your FastAPI.

## Scope

### 1. App shell & design system
- Vite + React + TypeScript + Tailwind + shadcn/ui
- Healthcare-CMS appropriate look: calm neutral palette, strong typography (Inter), generous spacing, accessible contrast (Section 508 in mind)
- Layout: top bar (logo, doc title, save state, user menu) + collapsible left nav (Documents, Templates, Library, Audit, Settings) + main work area
- Light/dark mode, responsive down to tablet

### 2. JWT authentication
- `/login` and `/forgot-password` pages
- `POST /auth/login` → store access token (in-memory) + refresh token (httpOnly cookie if backend supports, else localStorage with a clear note)
- Axios/fetch wrapper with:
  - `Authorization: Bearer <token>` injection
  - 401 → refresh-token retry → redirect to `/login` on failure
- `AuthProvider` + `useAuth()` + `<ProtectedRoute>` guard
- Role-aware UI (Author, Reviewer, Approver, Admin) — hide/show actions based on role claim

### 3. Document CMS workflows
- **Documents list**: searchable/filterable table (type: ANOC/SB/EOC/Provider Directory/Errata, status, owner, plan year, updated)
- **Create document**: choose type + template + plan year → opens editor
- **Editor page**: TinyMCE (`@tinymce/tinymce-react`) with CMS model-material toolbar, autosave, version sidebar, comments panel, status pill (Draft → In Review → Approved → Published)
- **Review actions**: submit, approve, reject with comment, request changes
- **Audit log** view per document

### 4. Document generation / export
- "Generate" button calls backend endpoint (e.g. `POST /documents/{id}/render?format=pdf|docx|html`)
- Polls job status, then downloads the artifact
- Preview pane (PDF.js) for the generated PDF
- Section 508 / accessibility preflight result panel (consumes backend report)

### 5. Supporting screens
- Templates library (browse / preview)
- User profile + password change
- Admin: users & roles (if backend exposes it)

## Out of scope (stays in your repo)
- FastAPI endpoints, Postgres schema, PDF rendering, accessibility checker, CI, `render.yaml`

## Technical details

```text
src/
  api/
    client.ts           # fetch wrapper, base URL from VITE_API_BASE_URL
    auth.ts             # login, refresh, me
    documents.ts        # list, get, save, render, versions
    templates.ts
  auth/
    AuthProvider.tsx
    ProtectedRoute.tsx
    useAuth.ts
  pages/
    Login.tsx
    ForgotPassword.tsx
    DocumentsList.tsx
    DocumentEditor.tsx  # TinyMCE + sidebar
    DocumentPreview.tsx # PDF.js
    Templates.tsx
    AuditLog.tsx
    Settings.tsx
  components/
    AppShell.tsx, TopBar.tsx, SideNav.tsx
    DocStatusPill.tsx, ReviewBar.tsx, VersionList.tsx
    ui/ (shadcn primitives)
  lib/ (utils, types)
  routes.tsx
```

Env: `VITE_API_BASE_URL`, `VITE_TINYMCE_API_KEY`.

### Assumptions I need confirmed before building
1. **Backend endpoints**: I'll assume `/auth/login`, `/auth/refresh`, `/auth/me`, `/documents`, `/documents/{id}`, `/documents/{id}/render`, `/templates`. If yours differ, share the OpenAPI/Swagger URL and I'll wire to actual paths.
2. **CORS**: your FastAPI must allow the Lovable preview origin during development.
3. **TinyMCE key**: I'll read from `VITE_TINYMCE_API_KEY` — you'll add it as a frontend env var.
4. **Refresh-token transport**: prefer httpOnly cookie. If the backend currently returns refresh tokens in JSON, I'll use localStorage and flag it as something to harden.

## Build order
1. Scaffold app shell + design system + routing
2. Auth (login, protected routes, token refresh)
3. Documents list + create flow
4. Editor (TinyMCE, autosave, status, versions)
5. Render + PDF preview + download
6. Templates, audit, settings
7. Role-based gating polish + a11y pass

When you approve, I'll start with steps 1–2 and pause for you to point me at the real backend URL + endpoint shapes before wiring step 3.
