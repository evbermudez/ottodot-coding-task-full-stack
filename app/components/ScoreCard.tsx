'use client'

import type { ScoreSummary } from '../types'

type ScoreCardProps = {
  score: ScoreSummary
  error: string
}

export function ScoreCard({ score, error }: ScoreCardProps) {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 mt-8 border border-emerald-100">
      <h2 className="text-2xl font-semibold mb-4 text-emerald-700 flex items-center gap-2">
        🏅 Your scorecard
      </h2>
      {error && <p className="text-sm text-red-600 mb-2">{error}</p>}
      {score.totalAttempts === 0 ? (
        <p className="text-gray-700 text-lg">
          No submissions yet—solve your first challenge to start your streak!
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard label="Total Attempts" value={score.totalAttempts} />
          <StatCard label="Correct Answers" value={score.correctAnswers} />
          <StatCard label="Accuracy" value={`${score.accuracy.toFixed(1)}%`} />
        </div>
      )}
    </div>
  )
}

type StatCardProps = {
  label: string
  value: string | number
}

function StatCard({ label, value }: StatCardProps) {
  return (
    <div className="p-5 border-2 border-emerald-200 rounded-xl text-center bg-emerald-50">
      <p className="text-sm text-emerald-700 uppercase tracking-wide">{label}</p>
      <p className="text-3xl font-bold text-emerald-900">{value}</p>
    </div>
  )
}
