# PortfolioMatch

PortfolioMatch is an admissions demo built with Next.js. It has two data modes:

- **Local demo:** With no Supabase variables, campaigns, applicants, decisions, and AI summaries stay in the current browser's `localStorage`.
- **Supabase + Google Drive demo:** Campaigns and applicants are shared through Supabase. Submitted PDFs are saved privately in the connected Google Drive account; Supabase keeps the Drive file ID. Teachers sign in through Supabase Auth to preview or download a PDF.

Neither mode is ready for real applicant data. The public submission API still needs durable rate limiting and operational controls before public deployment.

## Run

```bash
npm install
cp .env.example .env.local
npm run dev
```

## Supabase demo setup

1. Apply SQL files in `supabase/migrations/` in filename order to the intended Supabase project through Supabase MCP. The Google Drive migration adds a nullable `drive_file_id` for existing applications.
2. Create a teacher account in Supabase Auth. Add its `auth.users.id` to `public.teacher_members` through Supabase MCP. The app has no self-service teacher registration.
3. Set `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, and `SUPABASE_SECRET_KEY` in `.env.local`. The secret key stays server-side and must never use the `NEXT_PUBLIC_` prefix.
4. Configure Google Drive below, then restart the app. A teacher signs in, creates an admission round, and shares the generated `?campaign=...` link. Applicants on another browser can submit; the teacher sees them in Dashboard and Applicants.

The migration enables row-level security. Anonymous users have no direct table access. Teacher membership controls reading applicant data and changing decisions. The public campaign and submission routes use a server-only Supabase secret key. Database mode does not import old `localStorage` applicants or sample scores.

## Private Google Drive PDF storage

1. In Google Cloud, enable the Google Drive API, configure an OAuth consent screen, add your own Google account as a test user if the app is in testing, and create an OAuth client of type **Desktop app** or **Web application**.
2. Put its `GOOGLE_DRIVE_CLIENT_ID` and `GOOGLE_DRIVE_CLIENT_SECRET` in `.env.local` (server only). Run `node --env-file=.env.local scripts/connect-google-drive.mjs` on the computer with your browser; the script opens Google sign-in for the Drive account that should own the PDFs.
3. After consent, the script writes `GOOGLE_DRIVE_REFRESH_TOKEN` directly to `.env.local` without printing it. Restart the app. Do not send these values in chat or commit them. The OAuth grant requests only the `drive.file` scope for files this app creates.

If you created a **Web application** OAuth client and Google reports `redirect_uri_mismatch`, add exactly `http://127.0.0.1:8787/oauth2callback` to that client's Authorized redirect URIs. A Desktop app client uses the loopback redirect without that console field.

PDFs are created in the connected account's My Drive root with a `PortfolioMatch-<application-id>.pdf` name. The application API refuses new submissions with HTTP 503 when Drive credentials are missing; it never reports a successful application while silently discarding its PDF. After upload, Supabase stores the opaque Drive file ID. The teacher-only download route checks a Supabase Auth token and membership before streaming the private PDF. Existing applications created before this integration have no saved PDF unless their original file is separately available for a deliberate backfill; the two synthetic `qa-portfolio.pdf` applications were backfilled from the retained QA file.

This is still a demo: Drive and Supabase are separate systems, so a network interruption can leave an orphaned Drive file; retention and deletion workflows are not implemented. Avoid real applicant data until access, privacy, retention, abuse limits, and recovery have been reviewed.

If the OAuth consent screen is External and still in Testing, Google refresh tokens for this Drive scope expire after 7 days. Reconnect before a later demo or publish the OAuth app under the appropriate Google Cloud process.

## Optional Gemini review

Set `GEMINI_API_KEY` in `.env.local`. The default model is `gemini-3.5-flash`; change it with `GEMINI_MODEL`. A separate checkbox controls whether the PDF is sent to Gemini. In database mode the analysis result is saved to Supabase and the original PDF remains in private Google Drive. In local mode only the result stays in the browser. AI scores are suggestions; teachers make decisions.

AI accepts PDFs smaller than 45 MB; the general form accepts PDFs up to 50 MiB. Keep the submission page open until analysis finishes. A refresh during processing does not automatically retry AI even though Drive retains the PDF. Production AI review is disabled by default; `AI_REVIEW_PUBLIC_DEMO=true` enables it only for a controlled demo. Do not expose the current public submission or AI routes to real applicants before adding durable abuse limits, monitoring, retention rules, and a full privacy review.

## Checks

```bash
npm run typecheck
npm run build
```

See `assign/workflow/kan-supabase-handoff.md` for the schema, integration flow, and team QA checklist.
