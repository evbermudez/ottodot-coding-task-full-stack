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
    const { count: totalAttempts, error: totalError } = await supabase
      .from('math_problem_submissions')
      .select('id', { count: 'exact', head: true })

    if (totalError) {
      throw totalError
    }

    const { count: correctAnswers, error: correctError } = await supabase
      .from('math_problem_submissions')
      .select('id', { count: 'exact', head: true })
      .eq('is_correct', true)

    if (correctError) {
      throw correctError
    }

    const accuracy =
      totalAttempts && totalAttempts > 0
        ? Number(((correctAnswers ?? 0) / totalAttempts * 100).toFixed(1))
        : 0

    return NextResponse.json({
      totalAttempts: totalAttempts ?? 0,
      correctAnswers: correctAnswers ?? 0,
      accuracy
    })
  } catch (error) {
    console.error('Error fetching score:', error)
    return NextResponse.json(
      {
        error: 'Failed to load score.'
      },
      { status: 500 }
    )
  }
}
