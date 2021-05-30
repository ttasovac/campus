import NextDocument, { Html, Head, Main, NextScript } from 'next/document'

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
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    )
  }
}
