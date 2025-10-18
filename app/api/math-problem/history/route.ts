import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('math_problem_sessions')
      .select(
        `
          id,
          created_at,
          difficulty,
          problem_text,
          correct_answer,
          math_problem_submissions (
            id,
            created_at,
            user_answer,
            is_correct,
            feedback_text
          )
        `
      )
      .order('created_at', { ascending: false })
      .order('created_at', { foreignTable: 'math_problem_submissions', ascending: false })
      .limit(20)

    if (error) {
      throw error
    }

    return NextResponse.json({
      sessions: data ?? []
    })
  } catch (error) {
    console.error('Error fetching problem history:', error)
    return NextResponse.json(
      {
        error: 'Failed to load problem history.'
      },
      { status: 500 }
    )
  }
}
