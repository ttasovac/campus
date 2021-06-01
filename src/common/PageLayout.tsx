import type { ReactNode } from 'react'

import { PageFooter } from '@/common/PageFooter'
import { PageHeader } from '@/common/PageHeader'

export interface PageLayoutProps {
  children?: ReactNode
}

/**
 * Page layout.
 */
export function PageLayout(props: PageLayoutProps): JSX.Element {
  return (
    <div className="flex flex-col min-h-screen">
      <PageHeader />
      {props.children}
      <PageFooter />
    </div>
  )
}
