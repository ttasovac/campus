import type { ParsedUrlQuery } from 'querystring'

import type {
  GetStaticPathsResult,
  GetStaticPathsContext,
  GetStaticPropsContext,
  GetStaticPropsResult,
} from 'next'
import { Fragment } from 'react'

import type { Docs as DocsData } from '@/api/cms/docs'
import { getDocsById, getDocsFilePath, getDocsIds } from '@/api/cms/docs'
import { getLastUpdatedTimestamp } from '@/api/github'
import { PageContent } from '@/common/PageContent'
import { getLocale } from '@/i18n/getLocale'
import type { Dictionary } from '@/i18n/loadDictionary'
import { loadDictionary } from '@/i18n/loadDictionary'
import { useI18n } from '@/i18n/useI18n'
import { Mdx } from '@/mdx/Mdx'
import { Metadata } from '@/metadata/Metadata'
import { useAlternateUrls } from '@/metadata/useAlternateUrls'
import { useCanonicalUrl } from '@/metadata/useCanonicalUrl'
import type { TableOfContentsProps } from '@/post/TableOfContents'
import { TableOfContents } from '@/post/TableOfContents'
import type { ISODateString } from '@/utils/ts/aliases'

export interface DocsPageParams extends ParsedUrlQuery {
  id: string
}

export interface DocsPageProps {
  dictionary: Dictionary
  docs: DocsData
  lastUpdatedAt: ISODateString | null
}

/**
 * Creates docs pages.
 */
export async function getStaticPaths(
  context: GetStaticPathsContext,
): Promise<GetStaticPathsResult<DocsPageParams>> {
  const { locales } = getLocale(context)

  const paths = (
    await Promise.all(
      locales.map(async (locale) => {
        const ids = await getDocsIds(locale)
        return ids.map((id) => {
          return {
            params: { id },
            locale,
          }
        })
      }),
    )
  ).flat()

  return {
    paths,
    fallback: false,
  }
}

/**
 * Provides translations for docs page.
 */
export async function getStaticProps(
  context: GetStaticPropsContext<DocsPageParams>,
): Promise<GetStaticPropsResult<DocsPageProps>> {
  const { locale } = getLocale(context)

  const dictionary = await loadDictionary(locale, ['common'])

  const { id } = context.params as DocsPageParams
  const docs = await getDocsById(id, locale)
  const lastUpdatedAt = await getLastUpdatedTimestamp(
    getDocsFilePath(id, locale),
  )

  return {
    props: {
      dictionary,
      docs,
      lastUpdatedAt,
    },
  }
}

/**
 * Docs page.
 */
export default function DocsPage(props: DocsPageProps): JSX.Element {
  const { docs } = props
  const { metadata, toc } = docs.data

  const { t } = useI18n()
  const canonicalUrl = useCanonicalUrl()
  const languageAlternates = useAlternateUrls()

  return (
    <Fragment>
      <Metadata
        title={metadata.title}
        canonicalUrl={canonicalUrl}
        languageAlternates={languageAlternates}
      />
      <PageContent className="max-w-screen-lg px-6 py-24 mx-auto space-y-24 w-full">
        <div className="prose mx-auto max-w-80ch">
          <h1>{metadata.title}</h1>
          <Mdx code={docs.code} />
        </div>
      </PageContent>
    </Fragment>
  )
}
