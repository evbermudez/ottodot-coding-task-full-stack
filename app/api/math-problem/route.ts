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

const parseJson = (raw: string) => {
  try {
    const jsonMatch = raw.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error('AI response did not contain JSON object')
    }
    return JSON.parse(jsonMatch[0])
  } catch (error) {
    throw new Error(`Failed to parse AI response: ${(error as Error).message}`)
  }
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

export async function POST() {
  try {
    const textResponse = await generateText(
      [
        'Create a Primary 5 level math word problem that aligns with the Singapore Mathematics syllabus.',
        'Respond strictly as minified JSON with two properties: "problem_text" (string) and "final_answer" (number).',
        'Ensure the problem requires at most two computation steps and has a final numerical answer.',
        'Do not include any additional commentary, formatting, or markdown code fences.'
      ].join(' ')
    )

    const parsed = parseJson(textResponse) as {
      problem_text: string
      final_answer: number
    }

    if (
      !parsed ||
      typeof parsed.problem_text !== 'string' ||
      (typeof parsed.final_answer !== 'number' &&
        typeof parsed.final_answer !== 'string')
    ) {
      throw new Error('AI response missing required fields')
    }

    const finalAnswer = Number(parsed.final_answer)
    if (!Number.isFinite(finalAnswer)) {
      throw new Error('Final answer must be a finite number')
    }

    const { data, error } = await supabase
      .from('math_problem_sessions')
      .insert({
        problem_text: parsed.problem_text.trim(),
        correct_answer: finalAnswer
      })
      .select('id, problem_text, correct_answer')
      .single()

    if (error) {
      throw error
    }

    return NextResponse.json({
      sessionId: data.id,
      problem: {
        problem_text: data.problem_text,
        final_answer: Number(data.correct_answer)
      }
    })
  } catch (error) {
    console.error('Error generating math problem:', error)
    return NextResponse.json(
      {
        error: 'Failed to generate math problem. Please try again.'
      },
      { status: 500 }
    )
  }
}
