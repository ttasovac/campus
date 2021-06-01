import type { ReactNode } from 'react'

import { QuizControls } from '@/post/quiz/QuizControls'
import { isQuizQuestion } from '@/post/quiz/QuizQuestion'
import { getChildElements } from '@/utils/getChildElements'

export interface QuizCardLayoutProps {
  children?: ReactNode
  component?: JSX.Element
  onValidate: () => void
}

/**
 * Quiz card layout.
 */
export function QuizCardLayout(props: QuizCardLayoutProps): JSX.Element {
  const childElements = getChildElements(props.children)
  const question = childElements.filter(isQuizQuestion)

  return (
    <div className="flex flex-col p-8 space-y-8 rounded shadow">
      {question}
      {props.component}
      <QuizControls onValidate={props.onValidate} />
    </div>
  )
}
