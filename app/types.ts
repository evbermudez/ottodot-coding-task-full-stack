export type Difficulty = 'easy' | 'medium' | 'hard'
export type ProblemType = 'mixed' | 'addition' | 'subtraction' | 'multiplication' | 'division'

export interface MathProblem {
  problem_text: string
  final_answer: number
  difficulty: Difficulty
  problem_type: ProblemType
}

export interface SubmissionHistory {
  id: string
  created_at: string
  user_answer: number
  is_correct: boolean
  feedback_text: string
  hint_text?: string | null
  solution_steps?: string[] | null
}

export interface ProblemHistoryEntry {
  id: string
  created_at: string
  difficulty: Difficulty
  problem_type: ProblemType
  problem_text: string
  correct_answer: number
  math_problem_submissions: SubmissionHistory[]
}

export interface ScoreSummary {
  totalAttempts: number
  correctAnswers: number
  accuracy: number
}
