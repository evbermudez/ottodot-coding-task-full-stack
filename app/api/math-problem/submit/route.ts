import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { GoogleGenerativeAI } from '@google/generative-ai'

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
      .select('id, problem_text, correct_answer')
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

    const model = genAI.getGenerativeModel({ model: modelName })
    const result = await model.generateContent({
      contents: [
        {
          role: 'user',
          parts: [{ text: buildFeedbackPrompt({
            problemText: session.problem_text,
            correctAnswer,
            userAnswer: numericAnswer,
            isCorrect
          }) }]
        }
      ]
    })

    const feedbackText = result.response.text().trim()

    const { error: insertError } = await supabase
      .from('math_problem_submissions')
      .insert({
        session_id: session.id,
        user_answer: numericAnswer,
        is_correct: isCorrect,
        feedback_text: feedbackText
      })

    if (insertError) {
      throw insertError
    }

    return NextResponse.json({
      isCorrect,
      feedback: feedbackText
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
