'use client'

import { useCallback, useEffect, useState } from 'react'

interface MathProblem {
  problem_text: string
  final_answer: number
  difficulty: 'easy' | 'medium' | 'hard'
  problem_type: 'mixed' | 'addition' | 'subtraction' | 'multiplication' | 'division'
}

interface SubmissionHistory {
  id: string
  created_at: string
  user_answer: number
  is_correct: boolean
  feedback_text: string
  hint_text?: string | null
  solution_steps?: string[] | null
}

interface ProblemHistoryEntry {
  id: string
  created_at: string
  difficulty: MathProblem['difficulty']
  problem_type: MathProblem['problem_type']
  problem_text: string
  correct_answer: number
  math_problem_submissions: SubmissionHistory[]
}

interface ScoreSummary {
  totalAttempts: number
  correctAnswers: number
  accuracy: number
}

const DIFFICULTY_OPTIONS: MathProblem['difficulty'][] = ['easy', 'medium', 'hard']
const PROBLEM_TYPE_OPTIONS: MathProblem['problem_type'][] = [
  'mixed',
  'addition',
  'subtraction',
  'multiplication',
  'division'
]

const friendlyLabel = (label: string) =>
  label.charAt(0).toUpperCase() + label.slice(1)

const DIFFICULTY_THEME: Record<
  MathProblem['difficulty'],
  {
    buttonActive: string
    buttonInactive: string
    badge: string
  }
> = {
  easy: {
    buttonActive:
      'bg-emerald-400 text-white border-emerald-400 shadow-lg scale-105',
    buttonInactive:
      'bg-emerald-100 text-emerald-700 border-emerald-200 hover:border-emerald-300',
    badge: 'bg-emerald-200 text-emerald-800 border-emerald-300'
  },
  medium: {
    buttonActive:
      'bg-amber-400 text-white border-amber-400 shadow-lg scale-105',
    buttonInactive:
      'bg-amber-100 text-amber-700 border-amber-200 hover:border-amber-300',
    badge: 'bg-amber-200 text-amber-800 border-amber-300'
  },
  hard: {
    buttonActive:
      'bg-rose-500 text-white border-rose-500 shadow-lg scale-105',
    buttonInactive:
      'bg-rose-100 text-rose-700 border-rose-200 hover:border-rose-300',
    badge: 'bg-rose-200 text-rose-800 border-rose-300'
  }
}

export default function Home() {
  const [problem, setProblem] = useState<MathProblem | null>(null)
  const [userAnswer, setUserAnswer] = useState('')
  const [feedback, setFeedback] = useState('')
  const [solutionSteps, setSolutionSteps] = useState<string[]>([])
  const [hint, setHint] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isResetting, setIsResetting] = useState(false)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null)
  const [selectedDifficulty, setSelectedDifficulty] = useState<
    MathProblem['difficulty']
  >('medium')
  const [history, setHistory] = useState<ProblemHistoryEntry[]>([])
  const [isHistoryLoading, setIsHistoryLoading] = useState(false)
  const [historyError, setHistoryError] = useState('')
  const [score, setScore] = useState<ScoreSummary>({
    totalAttempts: 0,
    correctAnswers: 0,
    accuracy: 0
  })
  const [scoreError, setScoreError] = useState('')
  const [selectedProblemType, setSelectedProblemType] = useState<
    MathProblem['problem_type']
  >('mixed')

  const feedbackCardStyles =
    isCorrect === null
      ? 'bg-red-50 border-2 border-red-200'
      : isCorrect
        ? 'bg-green-50 border-2 border-green-200'
        : 'bg-yellow-50 border-2 border-yellow-200'

  const feedbackHeading =
    isCorrect === null
      ? '⚠️ Something went wrong'
      : isCorrect
        ? '✅ Correct!'
        : '❌ Not quite right'

  const fetchHistory = useCallback(async () => {
    try {
      setIsHistoryLoading(true)
      setHistoryError('')

      const response = await fetch('/api/math-problem/history')
      if (!response.ok) {
        throw new Error('Request failed')
      }

      const data = (await response.json()) as {
        sessions: ProblemHistoryEntry[]
      }

      setHistory(data.sessions ?? [])
    } catch (error) {
      console.error('Failed to load history:', error)
      setHistoryError('Unable to load problem history.')
    } finally {
      setIsHistoryLoading(false)
    }
  }, [])

  const fetchScore = useCallback(async () => {
    try {
      setScoreError('')
      const response = await fetch('/api/math-problem/score')

      if (!response.ok) {
        throw new Error('Request failed')
      }

      const data = (await response.json()) as {
        totalAttempts: number
        correctAnswers: number
        accuracy: number
      }

      setScore({
        totalAttempts: data.totalAttempts ?? 0,
        correctAnswers: data.correctAnswers ?? 0,
        accuracy: data.accuracy ?? 0
      })
    } catch (error) {
      console.error('Failed to load score:', error)
      setScoreError('Unable to update score right now.')
    }
  }, [])

  useEffect(() => {
    fetchHistory()
    fetchScore()
  }, [fetchHistory, fetchScore])

  const resetApp = async () => {
    try {
      setIsResetting(true)
      const response = await fetch('/api/math-problem/reset', {
        method: 'POST'
      })

      if (!response.ok) {
        throw new Error('Request failed')
      }

      setProblem(null)
      setUserAnswer('')
      setFeedback('')
      setHint('')
      setSolutionSteps([])
      setIsCorrect(null)
      setSessionId(null)
      setHistoryError('')
      await Promise.all([fetchHistory(), fetchScore()])
    } catch (error) {
      console.error('Failed to reset data:', error)
      setHistoryError('Unable to reset data right now. Please try again.')
    } finally {
      setIsResetting(false)
    }
  }

  const generateProblem = async () => {
    try {
      setIsGenerating(true)
      setFeedback('')
      setSolutionSteps([])
      setHint('')
      setIsCorrect(null)
      setUserAnswer('')

      const response = await fetch('/api/math-problem', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          difficulty: selectedDifficulty,
          problemType: selectedProblemType
        })
      })

      if (!response.ok) {
        throw new Error('Request failed')
      }

      const data = (await response.json()) as {
        sessionId: string
        problem: MathProblem
      }

      setProblem(data.problem)
      setSessionId(data.sessionId)
      fetchHistory()
      fetchScore()
    } catch (error) {
      console.error('Failed to generate problem:', error)
      setProblem(null)
      setSessionId(null)
      setFeedback('Unable to generate a problem right now. Please try again.')
    } finally {
      setIsGenerating(false)
    }
  }

  const submitAnswer = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!sessionId) {
      setFeedback('Please generate a problem before submitting an answer.')
      return
    }

    try {
      setIsSubmitting(true)
      setFeedback('')

      const response = await fetch('/api/math-problem/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          sessionId,
          userAnswer: Number(userAnswer)
        })
      })

      if (!response.ok) {
        throw new Error('Request failed')
      }

      const data = (await response.json()) as {
        isCorrect: boolean
        feedback: string
        hint?: string
        solutionSteps?: string[]
      }

      setIsCorrect(data.isCorrect)
      setFeedback(data.feedback)
      setHint(data.hint ?? '')
      setSolutionSteps(data.solutionSteps ?? [])
      setUserAnswer('')
      fetchHistory()
      fetchScore()
    } catch (error) {
      console.error('Failed to submit answer:', error)
      setIsCorrect(null)
      setFeedback('Unable to submit your answer right now. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-white">
      <main className="container mx-auto px-4 py-12 max-w-4xl">
        <h1 className="text-5xl font-extrabold text-center mb-10 text-blue-800 tracking-tight drop-shadow-sm">
          OttoDot Math Adventures
        </h1>
        
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
              onClick={resetApp}
              disabled={isGenerating || isSubmitting || isResetting}
              className="flex items-center gap-2 bg-red-500 hover:bg-red-600 disabled:bg-gray-300 text-white text-sm font-semibold px-4 py-2 rounded-xl transition shadow-md"
            >
              {isResetting ? 'Resetting...' : '🔁 Reset Progress'}
            </button>
          </div>

          <div className="grid gap-6 lg:grid-cols-2 pt-2">
            <div>
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">
                Difficulty
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {DIFFICULTY_OPTIONS.map((difficulty) => (
                  <button
                    key={difficulty}
                    type="button"
                    onClick={() => setSelectedDifficulty(difficulty)}
                    className={`px-4 py-3 rounded-xl border-2 font-semibold capitalize transition transform hover:-translate-y-1 ${
                      selectedDifficulty === difficulty
                        ? DIFFICULTY_THEME[difficulty].buttonActive
                        : DIFFICULTY_THEME[difficulty].buttonInactive
                    }`}
                    disabled={isGenerating || isSubmitting || isResetting}
                  >
                    {friendlyLabel(difficulty)}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">
                Problem type
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {PROBLEM_TYPE_OPTIONS.map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setSelectedProblemType(type)}
                    className={`px-4 py-3 rounded-xl border-2 font-semibold capitalize transition transform hover:-translate-y-1 ${
                      selectedProblemType === type
                        ? 'bg-purple-500 text-white border-purple-500 shadow-lg scale-105'
                        : 'bg-purple-50 text-purple-700 border-purple-200 hover:border-purple-400'
                    }`}
                    disabled={isGenerating || isSubmitting || isResetting}
                  >
                    {type === 'mixed' ? 'Surprise Me' : friendlyLabel(type)}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <button
            onClick={generateProblem}
            disabled={isGenerating || isSubmitting || isResetting}
            className="w-full bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500 hover:from-pink-600 hover:to-yellow-600 disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed text-white font-extrabold text-lg py-4 px-6 rounded-2xl transition duration-200 ease-in-out transform hover:scale-[1.03] shadow-lg"
          >
            {isGenerating ? 'Generating...' : 'Generate New Problem'}
          </button>
        </div>

        {problem && (
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 border border-indigo-100">
            <h2 className="text-2xl font-semibold mb-5 text-indigo-700 flex items-center gap-2">
              <span className="text-3xl">📝</span> Your math quest
            </h2>
            <div className="flex flex-wrap gap-2 mb-4">
              <span
                className={`inline-flex items-center px-4 py-1.5 rounded-full text-sm font-semibold uppercase tracking-wide border ${DIFFICULTY_THEME[problem.difficulty].badge}`}
              >
                {problem.difficulty.toUpperCase()}
              </span>
              <span className="inline-flex items-center px-4 py-1.5 rounded-full text-sm font-semibold uppercase tracking-wide bg-purple-100 text-purple-700 border border-purple-200">
                {problem.problem_type === 'mixed'
                  ? 'ANY OPERATION'
                  : problem.problem_type.toUpperCase()}
            </span>
          </div>
            <p className="text-2xl text-gray-900 leading-relaxed font-medium mb-6">
              {problem.problem_text}
            </p>

            <form onSubmit={submitAnswer} className="space-y-5">
              <label htmlFor="answer" className="block text-lg font-semibold text-gray-700">
                Your Answer
              </label>
              <div className="flex items-center gap-4">
                <input
                  type="number"
                  id="answer"
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  className="flex-1 px-5 py-3 border-2 border-indigo-200 rounded-xl focus:ring-4 focus:ring-indigo-200 focus:border-indigo-400 text-lg"
                  placeholder="Type your answer here..."
                  required
                />
                <button
                  type="submit"
                disabled={!userAnswer || isSubmitting || isGenerating || isResetting}
                  className="bg-emerald-500 hover:bg-emerald-600 disabled:bg-gray-400 text-white font-bold text-lg px-6 py-3 rounded-xl transition duration-200 ease-in-out shadow-md"
                >
                  {isSubmitting ? 'Checking...' : 'Check Answer'}
                </button>
              </div>
            </form>
          </div>
        )}

        {feedback && (
          <div className={`rounded-2xl shadow-lg p-6 border ${feedbackCardStyles}`}>
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">
              {feedbackHeading}
            </h2>
            <p className="text-gray-800 leading-relaxed">{feedback}</p>
          </div>
        )}

        {hint && (
          <div className="bg-purple-50 border-2 border-purple-200 rounded-2xl shadow-lg p-6 mt-6">
            <h2 className="text-2xl font-semibold mb-4 text-purple-700 flex items-center gap-2">
              💡 Clever Clue
            </h2>
            <p className="text-gray-800 leading-relaxed text-lg">{hint}</p>
          </div>
        )}

        {solutionSteps.length > 0 && (
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


        <div className="bg-white rounded-2xl shadow-lg p-6 mt-8 border border-emerald-100">
          <h2 className="text-2xl font-semibold mb-4 text-emerald-700 flex items-center gap-2">
            🏅 Your scorecard
          </h2>
          {scoreError && (
            <p className="text-sm text-red-600 mb-2">{scoreError}</p>
          )}
          {score.totalAttempts === 0 ? (
            <p className="text-gray-700 text-lg">
              No submissions yet—solve your first challenge to start your streak!
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-5 border-2 border-emerald-200 rounded-xl text-center bg-emerald-50">
                <p className="text-sm text-emerald-700 uppercase tracking-wide">
                  Total Attempts
                </p>
                <p className="text-3xl font-bold text-emerald-900">
                  {score.totalAttempts}
                </p>
              </div>
              <div className="p-5 border-2 border-emerald-200 rounded-xl text-center bg-emerald-50">
                <p className="text-sm text-emerald-700 uppercase tracking-wide">
                  Correct Answers
                </p>
                <p className="text-3xl font-bold text-emerald-900">
                  {score.correctAnswers}
                </p>
              </div>
              <div className="p-5 border-2 border-emerald-200 rounded-xl text-center bg-emerald-50">
                <p className="text-sm text-emerald-700 uppercase tracking-wide">
                  Accuracy
                </p>
                <p className="text-3xl font-bold text-emerald-900">
                  {score.accuracy.toFixed(1)}%
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 mt-8 border border-orange-100">
          <h2 className="text-2xl font-semibold mb-4 text-orange-600 flex items-center gap-2">
            📚 Problem history
          </h2>

          {historyError && (
            <p className="text-sm text-red-600 mb-2">{historyError}</p>
          )}

          {isHistoryLoading ? (
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
                          className={`inline-flex items-center px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wide border ${DIFFICULTY_THEME[entry.difficulty].badge}`}
                        >
                          {entry.difficulty.toUpperCase()}
                        </span>
                        <span className="inline-flex items-center px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wide bg-purple-100 text-purple-700 border border-purple-200">
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
                      <p className="text-sm text-gray-500">
                        No submission yet.
                      </p>
                    )}
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      </main>
    </div>
  )
}
