'use client'

import { ReactNode } from 'react'

type FeedbackSectionProps = {
  feedback: string
  isCorrect: boolean | null
  hint: string
  solutionSteps: string[]
}

const feedbackStyles = {
  correct: 'bg-green-50 border-2 border-green-200',
  incorrect: 'bg-yellow-50 border-2 border-yellow-200',
  error: 'bg-red-50 border-2 border-red-200'
}

const feedbackHeading = {
  correct: '✅ Correct!',
  incorrect: '❌ Not quite right',
  error: '⚠️ Something went wrong'
}

export function FeedbackSection({
  feedback,
  isCorrect,
  hint,
  solutionSteps
}: FeedbackSectionProps) {
  const stateKey =
    isCorrect === null ? 'error' : isCorrect ? 'correct' : 'incorrect'
  const hasFeedback = Boolean(feedback)
  const hasHint = Boolean(hint)
  const hasSolution = solutionSteps.length > 0

  if (!hasFeedback && !hasHint && !hasSolution) {
    return null
  }

  return (
    <>
      {hasFeedback && (
        <div className={`rounded-2xl shadow-lg p-6 border ${feedbackStyles[stateKey]}`}>
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">
            {feedbackHeading[stateKey]}
          </h2>
          <p className="text-gray-800 leading-relaxed">{feedback}</p>
        </div>
      )}

      {hasHint && (
        <div className="bg-purple-50 border-2 border-purple-200 rounded-2xl shadow-lg p-6 mt-6">
          <h2 className="text-2xl font-semibold mb-4 text-purple-700 flex items-center gap-2">
            💡 Clever Clue
          </h2>
          <p className="text-gray-800 leading-relaxed text-lg">{hint}</p>
        </div>
      )}

      {hasSolution && (
        <div className="bg-white rounded-2xl shadow-lg p-6 mt-6 border border-slate-200">
          <h2 className="text-2xl font-semibold mb-4 text-indigo-700 flex items-center gap-2">
            🪜 Step-by-step solution
          </h2>
          <ol className="list-decimal list-inside space-y-3 text-gray-800 text-lg">
            {solutionSteps.map((step, index) => (
              <li key={`${step}-${index}`} className="bg-indigo-50 px-4 py-2 rounded-lg border border-indigo-100">
                {step}
              </li>
            ))}
          </ol>
        </div>
      )}
    </>
  )
}
