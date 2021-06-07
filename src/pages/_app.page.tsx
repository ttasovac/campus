import 'tailwindcss/tailwind.css'
import '@algolia/autocomplete-theme-classic'
import '@/styles/index.css'

import ErrorBoundary from '@stefanprobst/next-error-boundary'
import type { AppProps } from 'next/app'
import Head from 'next/head'
import type { ComponentType } from 'react'
import { Fragment } from 'react'

import { useAnalytics } from '@/analytics/useAnalytics'
import { Favicons } from '@/assets/Favicons'
import { WebManifest } from '@/assets/WebManifest'
import { PageLayout } from '@/common/PageLayout'
import { Providers } from '@/common/Providers'
import { ClientError } from '@/error/ClientError'

/**
 * Application shell, shared by all pages.
 */
export default function App(props: AppProps): JSX.Element {
  const Component = props.Component as typeof props.Component & {
    Layout?: ComponentType
  }

  const Layout = Component.Layout ?? PageLayout

  useAnalytics()

  return (
    <Fragment>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>
      <Favicons />
      <WebManifest />
      <ErrorBoundary
        fallback={ClientError}
        resetOnChange={[props.router.asPath]}
      >
        <Providers {...props.pageProps}>
          <Layout>
            <Component {...props.pageProps} />
          </Layout>
        </Providers>
      </ErrorBoundary>
    </Fragment>
  )
}
