'use client'

import { FormEvent } from 'react'
import {
  DIFFICULTY_ICON,
  DIFFICULTY_THEME,
  PROBLEM_TYPE_ICON
} from '../constants'
import type { MathProblem } from '../types'

type ProblemCardProps = {
  problem: MathProblem
  userAnswer: string
  onAnswerChange: (value: string) => void
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
  isSubmitting: boolean
  isGenerating: boolean
  isResetting: boolean
  isCorrect: boolean | null
}

export function ProblemCard({
  problem,
  userAnswer,
  onAnswerChange,
  onSubmit,
  isSubmitting,
  isGenerating,
  isResetting,
  isCorrect
}: ProblemCardProps) {
  const disableInput =
    Boolean(isCorrect) || isSubmitting || isGenerating || isResetting

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 border border-indigo-100">
      <h2 className="text-2xl font-semibold mb-5 text-indigo-700 flex items-center gap-2">
        <span className="text-3xl">📝</span> Your math quest
      </h2>
      <div className="flex flex-wrap gap-2 mb-4">
        <span
          className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-semibold uppercase tracking-wide border ${DIFFICULTY_THEME[problem.difficulty].badge}`}
        >
          {DIFFICULTY_ICON[problem.difficulty]}
          {problem.difficulty.toUpperCase()}
        </span>
        <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-semibold uppercase tracking-wide bg-purple-100 text-purple-700 border border-purple-200">
          {PROBLEM_TYPE_ICON[problem.problem_type]}
          {problem.problem_type === 'mixed'
            ? 'ANY OPERATION'
            : problem.problem_type.toUpperCase()}
        </span>
      </div>
      <p className="text-2xl text-gray-900 leading-relaxed font-medium mb-6">
        {problem.problem_text}
      </p>

      <form onSubmit={onSubmit} className="space-y-5">
        <label htmlFor="answer" className="block text-lg font-semibold text-gray-700">
          Your Answer
        </label>
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <input
            type="number"
            id="answer"
            value={userAnswer}
            onChange={(e) => onAnswerChange(e.target.value)}
            className="flex-1 w-full px-5 py-3 border-2 border-indigo-200 rounded-xl focus:ring-4 focus:ring-indigo-200 focus:border-indigo-400 text-lg"
            placeholder="Type your answer here..."
            disabled={disableInput}
            required
          />
          <button
            type="submit"
            disabled={
              !userAnswer ||
              isSubmitting ||
              isGenerating ||
              isResetting ||
              Boolean(isCorrect)
            }
            className="w-full sm:w-auto bg-emerald-500 hover:bg-emerald-600 disabled:bg-gray-400 text-white font-bold text-lg px-6 py-3 rounded-xl transition duration-200 ease-in-out shadow-md text-center"
          >
            {isSubmitting ? 'Checking...' : 'Check Answer'}
          </button>
        </div>
      </form>
    </div>
  )
}
