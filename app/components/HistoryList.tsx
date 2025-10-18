'use client'

import {
  DIFFICULTY_ICON,
  DIFFICULTY_THEME,
  PROBLEM_TYPE_ICON
} from '../constants'
import type { ProblemHistoryEntry } from '../types'

type HistoryListProps = {
  history: ProblemHistoryEntry[]
  isLoading: boolean
  error: string
}

export function HistoryList({ history, isLoading, error }: HistoryListProps) {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 mt-8 border border-orange-100">
      <h2 className="text-2xl font-semibold mb-4 text-orange-600 flex items-center gap-2">
        📚 Problem history
      </h2>

      {error && <p className="text-sm text-red-600 mb-2">{error}</p>}

      {isLoading ? (
        <p className="text-gray-700 text-lg flex items-center gap-2">
          <span className="animate-spin">⏳</span> Loading history...
        </p>
      ) : history.length === 0 ? (
        <p className="text-gray-700 text-lg">
          No problems yet—tap “Generate New Problem” to start building your story!
        </p>
      ) : (
        <ul className="space-y-4">
          {history.map((entry) => {
            const latestSubmission = entry.math_problem_submissions?.[0]

            return (
              <li
                key={entry.id}
                className="border-2 border-orange-200 rounded-xl p-5 bg-orange-50 shadow-sm"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                  <div className="flex flex-wrap gap-2">
                    <span
                      className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wide border ${DIFFICULTY_THEME[entry.difficulty].badge}`}
                    >
                      {DIFFICULTY_ICON[entry.difficulty]}
                      {entry.difficulty.toUpperCase()}
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wide bg-purple-100 text-purple-700 border border-purple-200">
                      {PROBLEM_TYPE_ICON[entry.problem_type]}
                      {entry.problem_type === 'mixed'
                        ? 'ANY'
                        : entry.problem_type.toUpperCase()}
                    </span>
                  </div>
                  <span className="text-sm text-gray-500">
                    {new Date(entry.created_at).toLocaleString()}
                  </span>
                </div>

                <p className="text-gray-900 font-semibold text-lg mb-2">
                  {entry.problem_text}
                </p>

                <p className="text-sm text-gray-700 mb-2">
                  Correct answer:{' '}
                  <span className="font-bold text-gray-900">
                    {entry.correct_answer}
                  </span>
                </p>

                {latestSubmission ? (
                  <div>
                    <p
                      className={`text-sm font-semibold ${
                        latestSubmission.is_correct
                          ? 'text-emerald-700'
                          : 'text-rose-600'
                      }`}
                    >
                      {latestSubmission.is_correct
                        ? 'Answered correctly'
                        : 'Answered incorrectly'}
                    </p>
                    <p className="text-gray-700">
                      Your answer: {latestSubmission.user_answer}
                    </p>
                    <p className="text-gray-600 mt-1">
                      {latestSubmission.feedback_text}
                    </p>
                    {latestSubmission.hint_text && (
                      <p className="text-purple-700 mt-1">
                        Hint: {latestSubmission.hint_text}
                      </p>
                    )}
                    {latestSubmission.solution_steps &&
                      latestSubmission.solution_steps.length > 0 && (
                        <div className="mt-2 text-gray-700">
                          <p className="font-semibold">Solution steps:</p>
                          <ol className="list-decimal list-inside space-y-1 mt-1">
                            {latestSubmission.solution_steps.map((step, idx) => (
                              <li key={`${latestSubmission.id}-step-${idx}`}>
                                {step}
                              </li>
                            ))}
                          </ol>
                        </div>
                      )}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">No submission yet.</p>
                )}
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
