import Groq from 'groq-sdk'
import { NextResponse } from 'next/server'

type DebriefResult = {
  tldr: string
  action_items: string[]
  decisions: string[]
  followup_email: string
}

const systemPrompt = `You are a meeting debrief assistant. Given a raw meeting transcript, return a JSON object with exactly these four keys:
  tldr: string (3 sentences max)
  action_items: string[] (each item starts with owner name and colon)
  decisions: string[]
  followup_email: string (subject line first, then body, separated by a blank line)
Return only valid JSON, no markdown fences, no extra text.`

export async function POST(request: Request) {
  try {
    const { transcript } = await request.json()

    if (typeof transcript !== 'string' || !transcript.trim()) {
      return NextResponse.json(
        { error: 'Transcript is required.' },
        { status: 400 },
      )
    }

    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json(
        { error: 'Missing GROQ_API_KEY in .env.local.' },
        { status: 500 },
      )
    }

    const groq = new Groq({
      apiKey: process.env.GROQ_API_KEY,
    })

    const completion = await groq.chat.completions.create({
      model: 'llama-3.1-8b-instant',
      max_tokens: 1600,
      temperature: 0.2,
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'system',
          content: systemPrompt,
        },
        {
          role: 'user',
          content: transcript.trim(),
        },
      ],
    })

    const text = completion.choices[0]?.message.content?.trim()

    if (!text) {
      return NextResponse.json(
        { error: 'Groq returned an empty response.' },
        { status: 502 },
      )
    }

    const parsed = JSON.parse(text) as unknown

    if (!isDebriefResult(parsed)) {
      return NextResponse.json(
        { error: 'Groq returned an unexpected response shape.' },
        { status: 502 },
      )
    }

    return NextResponse.json(parsed)
  } catch (error) {
    console.error(error)
    if (error instanceof Error && error.message.includes('rate_limit_exceeded')) {
      return NextResponse.json(
        {
          error:
            'Groq rate limit reached. Wait a minute and try again, or use another Groq API key.',
        },
        { status: 429 },
      )
    }

    return NextResponse.json(
      { error: 'Could not generate a debrief. Please try again.' },
      { status: 500 },
    )
  }
}

function isDebriefResult(value: unknown): value is DebriefResult {
  if (!value || typeof value !== 'object') return false

  const candidate = value as Record<string, unknown>

  return (
    typeof candidate.tldr === 'string' &&
    Array.isArray(candidate.action_items) &&
    candidate.action_items.every((item) => typeof item === 'string') &&
    Array.isArray(candidate.decisions) &&
    candidate.decisions.every((item) => typeof item === 'string') &&
    typeof candidate.followup_email === 'string'
  )
}
