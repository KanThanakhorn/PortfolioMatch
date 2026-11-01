# PortfolioMatch

Interactive admissions demo built with Next.js. Admissions, applicants, decisions, and AI summaries are stored in the current browser; this is not a shared production database.

## Run

```bash
npm install
cp .env.example .env.local
npm run dev
```

Set `GEMINI_API_KEY` in `.env.local` to enable optional AI portfolio review in local development. The default model is `gemini-3.5-flash` and can be changed with `GEMINI_MODEL`. The applicant must select the separate AI consent checkbox before the PDF is sent to Gemini. The review compares the PDF against the current admission requirements and shows a suggested score, evidence by criterion, strengths, and gaps. Reviewers remain responsible for the admission decision.

Without a key, applications still save in the browser; the AI request shows a configuration error. The PDF itself is not retained by this app. AI review accepts PDFs smaller than 45 MB. Keep the submission page open until analysis finishes; a page reload during the request marks analysis as interrupted because the PDF is not stored for retry. Production AI review is disabled by default because the current prototype has no authentication or request limits.
