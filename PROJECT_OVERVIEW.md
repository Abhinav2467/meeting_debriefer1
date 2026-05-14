# Debrief — Project Overview

## 📌 What is Debrief?

**Debrief** is a single-page web app that transforms raw meeting transcripts into actionable intelligence in seconds. Paste an unstructured meeting recording or notes, and get:

1. **TL;DR** — A 3-sentence summary of the meeting
2. **Action Items** — Bulleted list with owner names (e.g., "Maya: Send launch email by Friday")
3. **Decisions** — Key decisions made during the meeting
4. **Follow-up Email** — A complete draft email (subject + body) ready to copy and send

**No database. No login. No saved history. Just paste, run, and copy.**

---

## 🎯 The Problem It Solves

Meeting transcripts are noisy. Even with a recording, extracting what matters is tedious:
- You have to manually scan for action items and spot who owns what
- You need to write a follow-up email from scratch
- Key decisions get buried in rambling conversation

Debrief automates this in one click using AI (Groq).

---

## 🛠 Tech Stack

| Layer | Tech | Why |
|-------|------|-----|
| **Frontend** | Next.js 14 (React) + TypeScript | Modern, type-safe, zero config |
| **Styling** | Tailwind CSS | Minimal, fast, no extra dependencies |
| **Backend** | Next.js API Routes | No separate backend needed |
| **AI Engine** | Groq (`llama-3.1-8b-instant`) | Fast, cheap, reliable inference |
| **Language** | TypeScript | Type safety across frontend & backend |
| **Deployment** | Vercel | Native Next.js support, free tier |

---

## 🏗 Project Structure

```
AI_Fellowship_Project/
├── app/
│   ├── page.tsx                    # Main UI (form + results)
│   ├── layout.tsx                  # Root layout
│   ├── globals.css                 # Global Tailwind styles
│   └── api/
│       └── debrief/
│           └── route.ts            # POST endpoint for debrief logic
├── package.json                    # Dependencies & scripts
├── tsconfig.json                   # TypeScript config
├── tailwind.config.ts              # Tailwind customization
├── next.config.mjs                 # Next.js config
├── .env.local.example              # Template for API key
├── .gitignore                       # Git ignore rules
└── README.md                        # Quick start guide
```

---

## 💡 How It Works

### **Frontend Flow** (`app/page.tsx`)

1. **User pastes transcript** into a textarea
2. **Clicks "Run Debrief"** button
3. Button shows spinner while loading
4. On success: renders four clean cards (TL;DR, Action Items, Decisions, Email)
5. On error: displays inline error message
6. **Copy button** on email card copies to clipboard

The UI includes a **pre-filled sample transcript** so reviewers can click "Run Debrief" immediately (after adding their API key).

### **Backend Flow** (`app/api/debrief/route.ts`)

1. Receive POST request with `transcript` field
2. Validate transcript is non-empty
3. Check `GROQ_API_KEY` is set
4. Call Groq API with:
   - **Model**: `llama-3.1-8b-instant` (fast, accurate, cheap)
   - **System Prompt**: Instructs the model to return exactly this JSON shape:
     ```json
     {
       "tldr": "string",
       "action_items": ["owner: task", ...],
       "decisions": ["string", ...],
       "followup_email": "Subject: ...\n\nBody..."
     }
     ```
   - **Settings**: `temperature: 0.2` (consistent, not random)
   - **Response Format**: `json_object` (enforces valid JSON)

5. Parse and validate the JSON response
6. Return to frontend or error message

**Error Handling:**
- Missing API key → 500 error with clear message
- Rate limit hit → 429 error with suggestion to wait or use another key
- Invalid JSON from model → 502 error (shouldn't happen with `json_object`, but handled)
- Empty transcript → 400 error

---

## 🎨 Design Principles

✅ **Minimal** — No fluff. One input, one output.  
✅ **Fast** — Results in 2–5 seconds depending on transcript length.  
✅ **Practical** — Action items are owner-prefixed. Email is ready to send.  
✅ **Accessible** — Semantic HTML, proper contrast, responsive layout.  
✅ **Type-Safe** — TypeScript prevents bugs on both frontend and backend.  

**No extras:**
- No database (stateless)
- No authentication (anyone can use)
- No file uploads (paste only)
- No history (single-use)
- No model switching (Groq only)
- No flashy animations or gradients

---

## 🚀 Getting Started

### **Prerequisites**
- Node.js 18+ (LTS recommended)
- npm or yarn

### **Setup**

```bash
# 1. Clone the repo
git clone https://github.com/Abhinav2467/Meeting_Debriefer.git
cd Meeting_Debriefer

# 2. Install dependencies
npm install

# 3. Create .env.local from template
cp .env.local.example .env.local

# 4. Add your Groq API key
# Open .env.local and replace the placeholder:
# GROQ_API_KEY=gsk_your_actual_key_here

# 5. Run the dev server
npm run dev
```

**Get a Groq API key:**
- Visit https://console.groq.com/keys
- Sign up (free)
- Copy your API key
- Paste into `.env.local`

**Test it:**
- Open http://localhost:3000
- A sample meeting transcript is already filled in
- Click "Run Debrief"
- See results appear in ~3 seconds

---

## 📝 Example Usage

### **Input (Sample Transcript)**
```
Maya: We need the launch email ready before the partner review.
Arjun: I can send the updated pricing doc by Friday.
Maya: Great. Let's keep the first rollout to existing customers only.
Leah: I'll draft the support FAQ and share it tomorrow.
Arjun: Decision sounds good. We can revisit the public launch after support signs off.
```

### **Output**

**TL;DR**
> Team discussed launch timing and rollout strategy. Arjun will provide pricing doc by Friday. Decision: start with existing customers only, revisit public launch after support review.

**Action Items**
- Arjun: Send updated pricing doc by Friday
- Maya: Prepare launch email before partner review
- Leah: Draft support FAQ and share tomorrow

**Decisions**
- First rollout will target existing customers only
- Public launch will be revisited after support team approval

**Follow-up Email**
```
Subject: Meeting Debrief – Launch Strategy & Next Steps

Hi team,

Here's a quick recap of today's meeting:

We've finalized the launch timeline and rollout strategy. Arjun will send the updated pricing documentation by Friday, and Maya will have the launch email ready before the partner review.

Action Items:
- Arjun: Updated pricing doc (Friday)
- Maya: Launch email (before partner review)
- Leah: Support FAQ draft (tomorrow)

Key Decision: We're starting the rollout with existing customers only. Once the support team signs off, we'll revisit the timeline for a public launch.

Let me know if you have questions.

Best,
[Your Name]
```

---

## 🔧 Development

### **Scripts**

```bash
npm run dev      # Start dev server (http://localhost:3000)
npm run build    # Build for production
npm run start    # Run production build locally
npm run lint     # Run ESLint
```

### **TypeScript**

The project uses strict TypeScript. Common types:

- **`DebriefResult`** — The output shape (tldr, action_items, decisions, followup_email)
- **Request validation** — Frontend checks transcript is non-empty before calling API
- **Response validation** — Backend validates Groq's JSON matches expected shape

### **Adding Features**

If you want to extend Debrief:
- **Add fields** to `DebriefResult` type in both `page.tsx` and `route.ts`
- **Update system prompt** in `route.ts` to instruct the model on new fields
- **Update frontend** to render new cards in `page.tsx`

Example: Add a "Risks" field:
1. Update `DebriefResult` to include `risks: string[]`
2. Update system prompt to request risks
3. Add a new `ResultCard` in the JSX

---

## 🌐 Deployment

### **Vercel (Recommended)**

Debrief is built for Vercel and deploys with zero configuration:

```bash
npm i -g vercel
vercel
```

Then:
1. Add `GROQ_API_KEY` in the Vercel project settings (Environment Variables)
2. Redeploy or push to main branch
3. It's live

### **Other Platforms**

Debrief runs on any Node.js 18+ host (Render, Railway, Heroku, etc.):

```bash
npm run build
npm run start
```

Set `GROQ_API_KEY` as an environment variable.

---

## 🔐 Security

✅ **API key never exposed:**
- `.env.local` is in `.gitignore` (not committed)
- API key lives on the server only
- Frontend never sees the key; backend makes Groq calls

✅ **No data storage:**
- Transcripts are processed and discarded immediately
- No database, no logs of transcripts

✅ **Groq API contract:**
- Rate limiting handled with clear error messages
- Model produces valid JSON (enforced by Groq)

---

## 📊 Performance

- **Frontend**: ~90 KB First Load JS (optimized with Next.js)
- **Backend**: ~2–5 seconds per transcript (depends on Groq inference time)
- **Max tokens**: 1600 (enough for 10+ minute transcripts)
- **Temperature**: 0.2 (consistent output, not random)

---

## 🤔 Common Questions

**Q: Can I use a different LLM (GPT, Claude, etc.)?**  
A: Currently Groq only. The system prompt and API shape are optimized for Groq's response format. Switching would require adapting the system prompt and validation logic.

**Q: Can I save my debriefs?**  
A: No database by design. Copy the results and save them yourself (email, doc, etc.). This keeps the app simple and avoids storage costs.

**Q: Does it work with non-English transcripts?**  
A: Partially. Groq supports many languages, but the system prompt is English. Try it; results may vary.

**Q: How much does it cost?**  
A: Groq has a free tier (~600k tokens/month). For higher volume, Groq offers paid plans starting at ~$0.70 per 1M tokens.

**Q: Can I deploy this myself?**  
A: Yes. Clone the repo, add your API key, and deploy to any Node.js host. Vercel is easiest.

---

## 🛣 Roadmap (Future Ideas)

- **Paste mode improvements**: Support longer transcripts, multiple speakers
- **Export formats**: Markdown, PDF, CSV
- **Advanced options**: Custom prompts, model selection, temperature tuning
- **Batch processing**: Upload multiple transcripts at once

---

## 📄 License

MIT — Use, modify, and distribute freely.

---

## 🙋 Questions?

- Check the [Quick Start README](README.md) for setup
- Review the code in `app/page.tsx` and `app/api/debrief/route.ts`
- Fork and experiment!

Happy debriefing! 🎉
