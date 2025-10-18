'use client'

import {
  DIFFICULTY_ICON,
  DIFFICULTY_OPTIONS,
  DIFFICULTY_THEME,
  PROBLEM_TYPE_ICON,
  PROBLEM_TYPE_OPTIONS,
  friendlyLabel
} from '../constants'
import type { Difficulty, ProblemType } from '../types'

type ChallengeControlsProps = {
  selectedDifficulty: Difficulty
  onDifficultyChange: (value: Difficulty) => void
  selectedProblemType: ProblemType
  onProblemTypeChange: (value: ProblemType) => void
  onGenerate: () => void
  onReset: () => void
  isGenerating: boolean
  isSubmitting: boolean
  isResetting: boolean
}

export function ChallengeControls({
  selectedDifficulty,
  onDifficultyChange,
  selectedProblemType,
  onProblemTypeChange,
  onGenerate,
  onReset,
  isGenerating,
  isSubmitting,
  isResetting
}: ChallengeControlsProps) {
  const isBusy = isGenerating || isSubmitting || isResetting

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 space-y-6 border border-blue-100">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-blue-700 flex items-center gap-2">
            <span className="text-2xl">🎯</span> Pick your challenge
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Choose a difficulty and problem type, then generate a fresh question.
          </p>
        </div>
        <button
          onClick={onReset}
          disabled={isBusy}
          className="flex items-center gap-2 bg-red-500 hover:bg-red-600 disabled:bg-gray-300 text-white text-sm font-semibold px-4 py-2 rounded-xl transition shadow-md"
        >
          {isResetting ? 'Resetting...' : '🔁 Reset Progress'}
        </button>
      </div>

      <div className="grid gap-6 lg:grid-cols-2 pt-2">
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">
            Difficulty
          </h3>
          <div className="flex flex-wrap gap-2 sm:gap-3">
            {DIFFICULTY_OPTIONS.map((difficulty) => (
              <button
                key={difficulty}
                type="button"
                onClick={() => onDifficultyChange(difficulty)}
                className={`flex-1 min-w-[150px] px-4 py-3 rounded-xl border-2 font-semibold capitalize transition transform hover:-translate-y-1 ${
                  selectedDifficulty === difficulty
                    ? DIFFICULTY_THEME[difficulty].buttonActive
                    : DIFFICULTY_THEME[difficulty].buttonInactive
                }`}
                disabled={isBusy}
              >
                <span className="text-lg">
                  {DIFFICULTY_ICON[difficulty]} {friendlyLabel(difficulty)}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">
            Problem type
          </h3>
          <div className="flex flex-wrap gap-2 sm:gap-3">
            {PROBLEM_TYPE_OPTIONS.map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => onProblemTypeChange(type)}
                className={`flex-1 min-w-[150px] px-4 py-3 rounded-xl border-2 font-semibold capitalize transition transform hover:-translate-y-1 ${
                  selectedProblemType === type
                    ? 'bg-purple-500 text-white border-purple-500 shadow-lg scale-105'
                    : 'bg-purple-50 text-purple-700 border-purple-200 hover:border-purple-400'
                }`}
                disabled={isBusy}
              >
                <span className="text-lg">
                  {PROBLEM_TYPE_ICON[type]}{' '}
                  {type === 'mixed' ? 'Surprise Me' : friendlyLabel(type)}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <button
        onClick={onGenerate}
        disabled={isBusy}
        className="w-full bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500 hover:from-pink-600 hover:to-yellow-600 disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed text-white font-extrabold text-lg py-4 px-6 rounded-2xl transition duration-200 ease-in-out transform hover:scale-[1.03] shadow-lg"
      >
        {isGenerating ? 'Generating...' : 'Generate New Problem'}
      </button>
    </div>
  )
}
