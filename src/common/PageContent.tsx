import type { ReactNode } from 'react'

export interface PageContentProps {
  children?: ReactNode
}

/**
 * Wraps main page content.
 */
export function PageContent(props: PageContentProps): JSX.Element {
  return (
    <main id="main" tabIndex={-1}>
      {props.children}
    </main>
  )
}
