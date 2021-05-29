import type { ReactNode } from 'react'
import { PageFooter } from '@/common/PageFooter'
import { PageHeader } from '@/common/PageHeader'

export interface PageLayoutProps {
  children?: ReactNode
}

/**
 * Shared page layout.
 */
export function PageLayout(props: PageLayoutProps): JSX.Element {
  return (
    <div className="min-h-screen grid grid-rows-page">
      <PageHeader />
      {props.children}
      <PageFooter />
    </div>
  )
}
