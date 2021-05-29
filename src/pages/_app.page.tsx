import 'tailwindcss/tailwind.css'
import '@/styles/index.css'

import type { AppProps } from 'next/app'
import Head from 'next/head'
import type { ComponentType } from 'react'
import { Fragment } from 'react'
import { PageLayout } from '@/common/PageLayout'
import { Providers } from '@/common/Providers'

/**
 * Application shell, shared by all pages.
 */
export default function App(props: AppProps): JSX.Element {
  const Component = props.Component as typeof props.Component & {
    Layout?: ComponentType
  }

  const Layout = Component.Layout ?? PageLayout

  return (
    <Fragment>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <Favicons />
        <WebManifest />
      </Head>
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
