import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

export async function POST() {
  try {
    const { error: deleteSubmissionsError } = await supabase
      .from('math_problem_submissions')
      .delete()
      .gt('created_at', '1970-01-01T00:00:00Z')

    if (deleteSubmissionsError) {
      throw deleteSubmissionsError
    }

    const { error: deleteSessionsError } = await supabase
      .from('math_problem_sessions')
      .delete()
      .gt('created_at', '1970-01-01T00:00:00Z')

    if (deleteSessionsError) {
      throw deleteSessionsError
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error resetting data:', error)
    return NextResponse.json(
      {
        error: 'Failed to reset data.'
      },
      { status: 500 }
    )
  }
}
