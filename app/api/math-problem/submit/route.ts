import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const modelName = process.env.GOOGLE_MODEL_NAME ?? 'models/gemini-2.0-flash'
const googleApiKey = process.env.GOOGLE_API_KEY
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const googleApiBase =
  process.env.GOOGLE_API_BASE_URL ??
  'https://generativelanguage.googleapis.com'
const googleApiVersion = process.env.GOOGLE_API_VERSION ?? 'v1beta'

if (!googleApiKey) {
  throw new Error('Missing GOOGLE_API_KEY environment variable')
}

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

type SubmissionRequest = {
  sessionId?: string
  userAnswer?: number | string
}

const buildFeedbackPrompt = (payload: {
  problemText: string
  correctAnswer: number
  userAnswer: number
  isCorrect: boolean
}) => {
  const { problemText, correctAnswer, userAnswer, isCorrect } = payload

  return [
    'You are a supportive Primary 5 mathematics tutor.',
    `A student attempted the following problem: "${problemText}".`,
    `The correct answer is ${correctAnswer}. The student answered ${userAnswer}.`,
    isCorrect
      ? 'Congratulate them briefly and reinforce the strategy that led to the correct answer.'
      : 'Explain where their reasoning likely went wrong and offer a clear tip to reach the correct answer next time.',
    'Keep the tone encouraging, concise, and actionable.',
    'Do not mention you are an AI. Respond in 2-4 sentences.'
  ].join(' ')
}

const buildHintPrompt = (payload: {
  problemText: string
  correctAnswer: number
  userAnswer?: number
}) => {
  const { problemText, correctAnswer, userAnswer } = payload

  return [
    'You are helping a Primary 5 student with a math word problem.',
    `Problem: "${problemText}".`,
    userAnswer !== undefined
      ? `The student is currently at this answer: ${userAnswer}. Provide a helpful hint that nudges them towards the correct approach without giving away the final answer (${correctAnswer}).`
      : 'Provide a helpful hint that nudges the student towards the correct approach without giving away the final answer.',
    'Keep the hint to 2 sentences and focus on strategy rather than the final numeric solution.'
  ].join(' ')
}

const buildSolutionPrompt = (payload: {
  problemText: string
  correctAnswer: number
}) => {
  const { problemText, correctAnswer } = payload

  return [
    'Provide a step-by-step solution for the following Primary 5 math problem.',
    `Problem: "${problemText}".`,
    `Final answer: ${correctAnswer}.`,
    'Return the response strictly as a JSON array of strings where each string is one concise step (do not include numbering or markdown).'
  ].join(' ')
}

type GenerationMethod = 'generateContent' | 'generateMessage' | 'generateText'

const buildRequestBody = (method: GenerationMethod, prompt: string) => {
  switch (method) {
    case 'generateContent':
      return {
        contents: [
          {
            role: 'user',
            parts: [{ text: prompt }]
          }
        ],
        generationConfig: {
          temperature: 0.7,
          candidateCount: 1
        }
      }
    case 'generateMessage':
      return {
        prompt: {
          messages: [
            {
              author: 'user',
              content: prompt
            }
          ]
        },
        temperature: 0.7,
        candidateCount: 1
      }
    default:
      return {
        prompt: { text: prompt },
        temperature: 0.7,
        candidateCount: 1
      }
  }
}

const extractCandidateText = (payload: any) => {
  const candidates = Array.isArray(payload?.candidates)
    ? payload.candidates
    : []

  for (const candidate of candidates) {
    if (typeof candidate?.output === 'string') {
      return candidate.output.trim()
    }

    if (typeof candidate?.content === 'string') {
      return candidate.content.trim()
    }

    const parts = candidate?.content?.parts ?? candidate?.content ?? []
    if (Array.isArray(parts)) {
      for (const part of parts) {
        if (typeof part?.text === 'string') {
          return part.text.trim()
        }
      }
    }
  }

  return null
}

const generateText = async (prompt: string) => {
  const modelPath = modelName.startsWith('models/')
    ? modelName
    : `models/${modelName}`

  const versions = Array.from(
    new Set([googleApiVersion, 'v1beta1', 'v1beta', 'v1'])
  ).filter(Boolean)

  const methods: GenerationMethod[] = [
    'generateContent',
    'generateMessage',
    'generateText'
  ]

  let lastError: Error | null = null

  for (const version of versions) {
    for (const method of methods) {
      const endpoint = `${googleApiBase}/${version}/${modelPath}:${method}?key=${googleApiKey}`

      try {
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(buildRequestBody(method, prompt))
        })

        const raw = await response.text()
        let payload: any = null

        if (raw) {
          try {
            payload = JSON.parse(raw)
          } catch {
            throw new Error(
              `Failed to parse Google response for ${version}/${method}: ${raw}`
            )
          }
        }

        if (!response.ok) {
          const message =
            payload?.error?.message ??
            (raw || `Model request failed with status ${response.status}`)

          if (response.status === 404) {
            lastError = new Error(
              `[${version} ${method}] ${message} (endpoint: ${endpoint})`
            )
            continue
          }

          throw new Error(
            `[${version} ${method}] ${message} (endpoint: ${endpoint})`
          )
        }

        const text = extractCandidateText(payload)

        if (!text) {
          throw new Error(
            `[${version} ${method}] Model response did not include text output${
              raw ? `: ${raw}` : ''
            }`
          )
        }

        return text
      } catch (error) {
        lastError = error as Error
      }
    }
  }

  throw lastError ?? new Error('Unable to generate text with Google API')
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as SubmissionRequest
    const sessionId = body.sessionId
    const numericAnswer = Number(body.userAnswer)

    if (!sessionId || !Number.isFinite(numericAnswer)) {
      return NextResponse.json(
        { error: 'Invalid submission payload.' },
        { status: 400 }
      )
    }

    const { data: session, error: sessionError } = await supabase
      .from('math_problem_sessions')
      .select('id, problem_text, correct_answer, difficulty, problem_type')
      .eq('id', sessionId)
      .single()

    if (sessionError || !session) {
      return NextResponse.json(
        { error: 'Problem session not found.' },
        { status: 404 }
      )
    }

    const correctAnswer = Number(session.correct_answer)
    const epsilon = 0.01
    const isCorrect = Math.abs(numericAnswer - correctAnswer) <= epsilon

    const [feedbackText, hintText, solutionStepsRaw] = await Promise.all([
      generateText(
        buildFeedbackPrompt({
          problemText: `${session.problem_text} (Difficulty: ${session.difficulty}, Type: ${session.problem_type})`,
          correctAnswer,
          userAnswer: numericAnswer,
          isCorrect
        })
      ),
      generateText(
        buildHintPrompt({
          problemText: session.problem_text,
          correctAnswer,
          userAnswer: isCorrect ? undefined : numericAnswer
        })
      ),
      generateText(
        buildSolutionPrompt({
          problemText: session.problem_text,
          correctAnswer
        })
      )
    ])

    let solutionSteps: string[] | null = null
    if (solutionStepsRaw) {
      try {
        const parsed = JSON.parse(solutionStepsRaw)
        if (Array.isArray(parsed)) {
          solutionSteps = parsed
            .filter((step) => typeof step === 'string')
            .map((step) => step.trim())
        }
      } catch (error) {
        console.warn('Failed to parse solution steps:', error, solutionStepsRaw)
      }
    }

    const { error: insertError } = await supabase
      .from('math_problem_submissions')
      .insert({
        session_id: session.id,
        user_answer: numericAnswer,
        is_correct: isCorrect,
        feedback_text: feedbackText,
        hint_text: hintText,
        solution_steps: solutionSteps
      })

    if (insertError) {
      throw insertError
    }

    return NextResponse.json({
      isCorrect,
      feedback: feedbackText,
      hint: hintText,
      solutionSteps: solutionSteps ?? []
    })
  } catch (error) {
    console.error('Error submitting answer:', error)
    return NextResponse.json(
      {
        error: 'Failed to submit answer. Please try again.'
      },
      { status: 500 }
    )
  }
}
