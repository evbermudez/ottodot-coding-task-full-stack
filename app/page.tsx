'use client'

import { useState } from 'react'

interface MathProblem {
  problem_text: string
  final_answer: number
  difficulty: 'easy' | 'medium' | 'hard'
}

export default function Home() {
  const [problem, setProblem] = useState<MathProblem | null>(null)
  const [userAnswer, setUserAnswer] = useState('')
  const [feedback, setFeedback] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null)
  const [selectedDifficulty, setSelectedDifficulty] = useState<
    MathProblem['difficulty']
  >('medium')

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

  const generateProblem = async () => {
    try {
      setIsGenerating(true)
      setFeedback('')
      setIsCorrect(null)
      setUserAnswer('')

      const response = await fetch('/api/math-problem', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          difficulty: selectedDifficulty
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
      }

      setIsCorrect(data.isCorrect)
      setFeedback(data.feedback)
      setUserAnswer('')
    } catch (error) {
      console.error('Failed to submit answer:', error)
      setIsCorrect(null)
      setFeedback('Unable to submit your answer right now. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <h1 className="text-4xl font-bold text-center mb-8 text-gray-800">
          Math Problem Generator
        </h1>
        
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6 space-y-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-700 mb-3">
              Choose difficulty
            </h2>
            <div className="grid grid-cols-3 gap-2">
              {(['easy', 'medium', 'hard'] as const).map((difficulty) => (
                <button
                  key={difficulty}
                  type="button"
                  onClick={() => setSelectedDifficulty(difficulty)}
                  className={`py-2 rounded-lg border font-semibold capitalize transition ${
                    selectedDifficulty === difficulty
                      ? 'bg-blue-600 text-white border-blue-600 shadow-md'
                      : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400'
                  }`}
                  disabled={isGenerating || isSubmitting}
                >
                  {difficulty}
                </button>
              ))}
            </div>
          </div>
          <button
            onClick={generateProblem}
            disabled={isGenerating || isSubmitting}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold py-3 px-4 rounded-lg transition duration-200 ease-in-out transform hover:scale-105"
          >
            {isGenerating ? 'Generating...' : 'Generate New Problem'}
          </button>
        </div>

        {problem && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-700">Problem:</h2>
            <span className="inline-flex items-center px-3 py-1 mb-4 rounded-full text-sm font-semibold uppercase tracking-wide bg-blue-50 text-blue-700 border border-blue-200">
              {problem.difficulty.toUpperCase()}
            </span>
            <p className="text-lg text-gray-800 leading-relaxed mb-6">
              {problem.problem_text}
            </p>
            
            <form onSubmit={submitAnswer} className="space-y-4">
              <div>
                <label htmlFor="answer" className="block text-sm font-medium text-gray-700 mb-2">
                  Your Answer:
                </label>
                <input
                  type="number"
                  id="answer"
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your answer"
                  required
                />
              </div>
              
              <button
                type="submit"
                disabled={!userAnswer || isSubmitting || isGenerating}
                className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-bold py-3 px-4 rounded-lg transition duration-200 ease-in-out transform hover:scale-105"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Answer'}
              </button>
            </form>
          </div>
        )}

        {feedback && (
          <div className={`rounded-lg shadow-lg p-6 ${feedbackCardStyles}`}>
            <h2 className="text-xl font-semibold mb-4 text-gray-700">
              {feedbackHeading}
            </h2>
            <p className="text-gray-800 leading-relaxed">{feedback}</p>
          </div>
        )}
      </main>
    </div>
  )
}
