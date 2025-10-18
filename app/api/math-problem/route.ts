import { NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { createClient } from '@supabase/supabase-js'

const modelName = 'gemini-pro'
const googleApiKey = process.env.GOOGLE_API_KEY
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!googleApiKey) {
  throw new Error('Missing GOOGLE_API_KEY environment variable')
}

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

const genAI = new GoogleGenerativeAI(googleApiKey)
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

export async function POST() {
  try {
    const model = genAI.getGenerativeModel({ model: modelName })
    const result = await model.generateContent({
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: [
                'Create a Primary 5 level math word problem that aligns with the Singapore Mathematics syllabus.',
                'Respond strictly as minified JSON with two properties: "problem_text" (string) and "final_answer" (number).',
                'Ensure the problem requires at most two computation steps and has a final numerical answer.',
                'Do not include any additional commentary, formatting, or markdown code fences.'
              ].join(' ')
            }
          ]
        }
      ]
    })

    const textResponse = result.response.text()
    const parsed = parseJson(textResponse) as {
      problem_text: string
      final_answer: number
    }

    if (
      !parsed ||
      typeof parsed.problem_text !== 'string' ||
      (typeof parsed.final_answer !== 'number' && typeof parsed.final_answer !== 'string')
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
