# PortfolioMatch

PortfolioMatch is an admissions demo built with Next.js. It has two data modes:

- **Local demo:** With no Supabase variables, campaigns, applicants, decisions, and AI summaries stay in the current browser's `localStorage`.
- **Supabase demo:** With Supabase configured, campaigns and applicants are shared across browsers. Teachers sign in through Supabase Auth. Portfolio PDF content is still not stored; only its file name and any consented Gemini analysis are saved.

Neither mode is ready for real applicant data. The public submission API still needs durable rate limiting and operational controls before public deployment.

## Run

```bash
npm install
cp .env.example .env.local
npm run dev
```

## Supabase demo setup

1. Apply both SQL files in `supabase/migrations/` in filename order to the intended Supabase project through Supabase MCP. They create the tables, policies, and foreign-key indexes.
2. Create a teacher account in Supabase Auth. Add its `auth.users.id` to `public.teacher_members` through Supabase MCP. The app has no self-service teacher registration.
3. Set `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, and `SUPABASE_SECRET_KEY` in `.env.local`. The secret key stays server-side and must never use the `NEXT_PUBLIC_` prefix.
4. Restart the app. A teacher signs in, creates an admission round, and shares the generated `?campaign=...` link. Applicants on another browser can submit; the teacher sees them in Dashboard and Applicants.

The migration enables row-level security. Anonymous users have no direct table access. Teacher membership controls reading applicant data and changing decisions. The public campaign and submission routes use a server-only Supabase secret key. Database mode does not import old `localStorage` applicants or sample scores.

## Optional Gemini review

Set `GEMINI_API_KEY` in `.env.local`. The default model is `gemini-3.5-flash`; change it with `GEMINI_MODEL`. A separate checkbox controls whether the PDF is sent to Gemini. In database mode the analysis result is saved to the application in Supabase, while the PDF is discarded after processing. In local mode the result stays in the browser. AI scores are suggestions; teachers make decisions.

AI accepts PDFs smaller than 45 MB; the general form accepts PDFs up to 50 MiB. Keep the submission page open until analysis finishes. A refresh during processing cannot retry because the PDF is not retained. Production AI review is disabled by default; `AI_REVIEW_PUBLIC_DEMO=true` enables it only for a controlled demo. Do not expose the current public submission or AI routes to real applicants before adding durable abuse limits, monitoring, retention rules, and a full privacy review.

## Checks

```bash
npm run typecheck
npm run build
```

See `assign/workflow/kan-supabase-handoff.md` for the schema, integration flow, and team QA checklist.
