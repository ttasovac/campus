import 'tailwindcss/tailwind.css'
import '@/styles/index.css'

import type { AppProps } from 'next/app'
import type { ComponentType } from 'react'
import { PageLayout } from '@/common/PageLayout'

/**
 * Application shell, shared by all pages.
 */
export default function App(props: AppProps): JSX.Element {
  const Component = props.Component as typeof props.Component & {
    Layout?: ComponentType
  }

  const Layout = Component.Layout ?? PageLayout

  return (
    <Layout>
      <Component {...props.pageProps} />
    </Layout>
  )
}
