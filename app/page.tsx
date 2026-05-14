'use client'

import type { ReactNode } from 'react'
import { useState } from 'react'

type DebriefResult = {
  tldr: string
  action_items: string[]
  decisions: string[]
  followup_email: string
}

const sampleTranscript = `Maya: We need the launch email ready before the partner review.
Arjun: I can send the updated pricing doc by Friday.
Maya: Great. Let's keep the first rollout to existing customers only.
Leah: I'll draft the support FAQ and share it tomorrow.
Arjun: Decision sounds good. We can revisit the public launch after support signs off.`

export default function Home() {
  const [transcript, setTranscript] = useState(sampleTranscript)
  const [result, setResult] = useState<DebriefResult | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  async function runDebrief() {
    const trimmed = transcript.trim()
    if (!trimmed) {
      setError('Paste a meeting transcript before running the debrief.')
      return
    }

    setLoading(true)
    setError('')
    setCopied(false)

    try {
      const response = await fetch('/api/debrief', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transcript: trimmed }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error ?? 'Could not run the debrief.')
      }

      setResult(data)
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : 'Something went wrong while running the debrief.',
      )
    } finally {
      setLoading(false)
    }
  }

  async function copyEmail() {
    if (!result?.followup_email) return
    await navigator.clipboard.writeText(result.followup_email)
    setCopied(true)
  }

  return (
    <main className="min-h-screen px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <header className="mb-8">
          <p className="mb-2 text-sm font-medium uppercase tracking-wide text-slate-500">
            Debrief
          </p>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
            Turn a raw meeting transcript into the follow-up you actually need.
          </h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600">
            Paste the transcript, run one pass, and get a crisp summary, owners,
            decisions, and a ready-to-send email.
          </p>
        </header>

        <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <label
            htmlFor="transcript"
            className="mb-2 block text-sm font-medium text-slate-700"
          >
            Meeting transcript
          </label>
          <textarea
            id="transcript"
            value={transcript}
            onChange={(event) => setTranscript(event.target.value)}
            placeholder="Paste your meeting transcript here..."
            className="min-h-[200px] w-full resize-y rounded-md border border-slate-300 px-3 py-3 text-sm leading-6 text-slate-900 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
          />

          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
            <button
              type="button"
              onClick={runDebrief}
              disabled={loading}
              className="inline-flex h-10 items-center justify-center rounded-md bg-slate-950 px-4 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading ? (
                <>
                  <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Running
                </>
              ) : (
                'Run Debrief'
              )}
            </button>
            {error ? <p className="text-sm text-red-600">{error}</p> : null}
          </div>
        </section>

        {result ? (
          <section className="mt-6 grid gap-4">
            <ResultCard title="TL;DR">
              <p className="whitespace-pre-wrap text-sm leading-6 text-slate-700">
                {result.tldr}
              </p>
            </ResultCard>

            <ResultCard title="Action Items">
              <BulletedList items={result.action_items} emptyText="No action items found." />
            </ResultCard>

            <ResultCard title="Decisions">
              <BulletedList items={result.decisions} emptyText="No decisions found." />
            </ResultCard>

            <ResultCard
              title="Follow-up Email"
              action={
                <button
                  type="button"
                  onClick={copyEmail}
                  className="rounded-md border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                >
                  {copied ? 'Copied' : 'Copy'}
                </button>
              }
            >
              <pre className="whitespace-pre-wrap font-sans text-sm leading-6 text-slate-700">
                {result.followup_email}
              </pre>
            </ResultCard>
          </section>
        ) : null}
      </div>
    </main>
  )
}

function ResultCard({
  title,
  action,
  children,
}: {
  title: string
  action?: ReactNode
  children: ReactNode
}) {
  return (
    <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-3 flex items-center justify-between gap-4">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
          {title}
        </h2>
        {action}
      </div>
      {children}
    </article>
  )
}

function BulletedList({
  items,
  emptyText,
}: {
  items: string[]
  emptyText: string
}) {
  if (!items.length) {
    return <p className="text-sm text-slate-500">{emptyText}</p>
  }

  return (
    <ul className="list-disc space-y-2 pl-5 text-sm leading-6 text-slate-700">
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  )
}
