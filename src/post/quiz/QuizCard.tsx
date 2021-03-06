import type { ReactElement, ReactNode } from 'react'

import { useQuiz } from '@/post/quiz/Quiz'

export interface QuizCardProps {
  children?: ReactNode
}

/**
 * Quiz card.
 */
export function QuizCard(props: QuizCardProps): JSX.Element {
  const { isHidden } = useQuiz()
  return <div hidden={isHidden}>{props.children}</div>
}

/**
 * Type guard for QuizCard component.
 */
export function isQuizCard(
  component: JSX.Element,
): component is ReactElement<QuizCardProps> {
  return component.type === QuizCard
}
