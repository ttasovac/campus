import cx from 'clsx'
import type { ReactNode } from 'react'

export interface PageContentProps {
  children?: ReactNode
  className?: string
}

/**
 * PageContent.
 */
export function PageContent(props: PageContentProps): JSX.Element {
  return (
    <main
      id="main"
      tabIndex={-1}
      className={cx('flex-1 mt-24', props.className)}
    >
      {props.children}
    </main>
  )
}
