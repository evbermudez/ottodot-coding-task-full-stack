'use client'

import { FormEvent, useCallback, useEffect, useState } from 'react'

import { ChallengeControls } from './components/ChallengeControls'
import { FeedbackSection } from './components/FeedbackSection'
import { HistoryList } from './components/HistoryList'
import { ProblemCard } from './components/ProblemCard'
import { ScoreCard } from './components/ScoreCard'
import type {
  Difficulty,
  MathProblem,
  ProblemHistoryEntry,
  ProblemType,
  ScoreSummary
} from './types'

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
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty>('medium')
  const [history, setHistory] = useState<ProblemHistoryEntry[]>([])
  const [isHistoryLoading, setIsHistoryLoading] = useState(false)
  const [historyError, setHistoryError] = useState('')
  const [score, setScore] = useState<ScoreSummary>({
    totalAttempts: 0,
    correctAnswers: 0,
    accuracy: 0
  })
  const [scoreError, setScoreError] = useState('')
  const [selectedProblemType, setSelectedProblemType] = useState<ProblemType>('mixed')

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

  const submitAnswer = async (e: FormEvent<HTMLFormElement>) => {
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

        <ChallengeControls
          selectedDifficulty={selectedDifficulty}
          onDifficultyChange={setSelectedDifficulty}
          selectedProblemType={selectedProblemType}
          onProblemTypeChange={setSelectedProblemType}
          onGenerate={generateProblem}
          onReset={resetApp}
          isGenerating={isGenerating}
          isSubmitting={isSubmitting}
          isResetting={isResetting}
        />

        {problem && (
          <ProblemCard
            problem={problem}
            userAnswer={userAnswer}
            onAnswerChange={setUserAnswer}
            onSubmit={submitAnswer}
            isSubmitting={isSubmitting}
            isGenerating={isGenerating}
            isResetting={isResetting}
            isCorrect={isCorrect}
          />
        )}

        <FeedbackSection
          feedback={feedback}
          isCorrect={isCorrect}
          hint={hint}
          solutionSteps={solutionSteps}
        />

        <ScoreCard score={score} error={scoreError} />

        <HistoryList
          history={history}
          isLoading={isHistoryLoading}
          error={historyError}
        />
      </main>
    </div>
  )
}
