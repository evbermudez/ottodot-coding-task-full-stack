import { Difficulty, ProblemType } from './types'

export const DIFFICULTY_OPTIONS: Difficulty[] = ['easy', 'medium', 'hard']

export const PROBLEM_TYPE_OPTIONS: ProblemType[] = [
  'mixed',
  'addition',
  'subtraction',
  'multiplication',
  'division'
]

export const friendlyLabel = (label: string) =>
  label.charAt(0).toUpperCase() + label.slice(1)

export const DIFFICULTY_THEME: Record<
  Difficulty,
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

export const DIFFICULTY_ICON: Record<Difficulty, string> = {
  easy: '🙂',
  medium: '😎',
  hard: '🚀'
}

export const PROBLEM_TYPE_ICON: Record<ProblemType, string> = {
  mixed: '🎲',
  addition: '➕',
  subtraction: '➖',
  multiplication: '✖️',
  division: '➗'
}
