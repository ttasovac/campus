import { createContext, useContext, useState } from 'react'
import type { ReactNode } from 'react'

import { MultipleChoice } from '@/post/quiz/MultipleChoice'
import { isQuizCard, QuizCard } from '@/post/quiz/QuizCard'
import { QuizQuestion } from '@/post/quiz/QuizQuestion'
import { XmlCodeEditor } from '@/post/quiz/XmlCodeEditor'
import { getChildElements } from '@/utils/getChildElements'
import type { Values } from '@/utils/ts/enum'

export interface QuizService {
  hasNext: boolean
  hasPrevious: boolean
  next: () => void
  previous: () => void
  setStatus: (status: QuizCardStatus) => void
  status: QuizCardStatus
  nextStatus: QuizCardStatus | undefined
  previousStatus: QuizCardStatus | undefined
  isHidden: boolean
}

const QuizContext = createContext<QuizService | null>(null)

export function useQuiz(): QuizService {
  const state = useContext(QuizContext)

  if (state === null) {
    throw new Error('`useQuiz` must be nested inside a `Quiz`.')
  }

  return state
}

export const QuizCardStatus = {
  UNANSWERED: 0,
  INCORRECT: 1,
  CORRECT: 2,
} as const
export type QuizCardStatus = Values<typeof QuizCardStatus>

export interface QuizProps {
  children?: ReactNode
}

/**
 * Quiz.
 */
export function Quiz(props: QuizProps): JSX.Element | null {
  const childElements = getChildElements(props.children)
  const cards = childElements.filter(isQuizCard)

  const [cardsStatus, setCardsStatus] = useState<Array<QuizCardStatus>>(
    Array(cards.length).fill(QuizCardStatus.UNANSWERED),
  )
  const [currentIndex, setCurrentIndex] = useState(0)
  const hasNext = currentIndex < cards.length - 1
  const hasPrevious = currentIndex > 0

  function next() {
    if (hasNext) {
      setCurrentIndex((currentIndex) => currentIndex + 1)
    }
  }

  function previous() {
    if (hasPrevious) {
      setCurrentIndex((currentIndex) => currentIndex - 1)
    }
  }

  if (cards.length === 0) return null

  return (
    <aside>
      {cards.map((card, index) => {
        function setStatus(status: QuizCardStatus) {
          setCardsStatus((cardsStatus) => {
            const newCardsStatus = [...cardsStatus]
            newCardsStatus[index] = status
            return newCardsStatus
          })
        }

        /* eslint-disable-next-line @typescript-eslint/no-non-null-assertion */
        const status = cardsStatus[index]!
        const nextStatus = cardsStatus[index + 1]
        const previousStatus = cardsStatus[index - 1]
        /** Hidden quiz cards are rendered but hidden, in order to preserve component state. */
        const isHidden = index !== currentIndex

        const service = {
          hasNext,
          hasPrevious,
          next,
          previous,
          setStatus,
          status,
          nextStatus,
          previousStatus,
          isHidden,
        }

        return (
          <QuizContext.Provider key={index} value={service}>
            {card}
          </QuizContext.Provider>
        )
      })}
    </aside>
  )
}

Quiz.Card = QuizCard
Quiz.Question = QuizQuestion
Quiz.MultipleChoice = MultipleChoice
Quiz.XmlCodeEditor = XmlCodeEditor
