import NextDocument, { Html, Head, Main, NextScript } from 'next/document'

import { Analytics } from '@/analytics/Analytics'
import { Fonts } from '@/assets/Fonts'

/**
 * Shared document wrapper.
 */
export default class Document extends NextDocument {
  render(): JSX.Element {
    return (
      <Html>
        <Head>
          <Fonts />
          <Analytics />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    )
  }
}
