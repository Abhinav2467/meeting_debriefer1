# Debrief

Debrief turns raw meeting transcripts into a concise summary, action items, decisions, and a draft follow-up email using Groq.

## Setup

```bash
npm install
```

Create `.env.local` and add:

```bash
GROQ_API_KEY=your_groq_api_key_here
```

You can get a free API key from https://console.groq.com/keys.

Run the app:

```bash
npm run dev
```

Open `http://localhost:3000`.

## Deploy

Debrief deploys to Vercel with zero config. Add `GROQ_API_KEY` in the Vercel project environment variables before deploying.
