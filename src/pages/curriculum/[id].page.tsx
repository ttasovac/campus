import type { ParsedUrlQuery } from 'querystring'

import { JsonLd } from '@stefanprobst/next-page-metadata'
import type {
  GetStaticPathsContext,
  GetStaticPathsResult,
  GetStaticPropsContext,
  GetStaticPropsResult,
} from 'next'
import { Fragment } from 'react'

import type { Collection as CollectionData } from '@/api/cms/collection'
import {
  getCollectionById,
  getCollectionFilePath,
  getCollectionIds,
} from '@/api/cms/collection'
import { getLastUpdatedTimestamp } from '@/api/github'
import { PageContent } from '@/common/PageContent'
import { getLocale } from '@/i18n/getLocale'
import type { Dictionary } from '@/i18n/loadDictionary'
import { loadDictionary } from '@/i18n/loadDictionary'
import { Metadata } from '@/metadata/Metadata'
import { useAlternateUrls } from '@/metadata/useAlternateUrls'
import { useCanonicalUrl } from '@/metadata/useCanonicalUrl'
import { Collection } from '@/post/Collection'
import type { ISODateString } from '@/utils/ts/aliases'

export interface CollectionPageParams extends ParsedUrlQuery {
  id: string
}

export interface CollectionPageProps {
  dictionary: Dictionary
  collection: CollectionData
  lastUpdatedAt: ISODateString | null
}

/**
 * Creates page for every collection.
 */
export async function getStaticPaths(
  context: GetStaticPathsContext,
): Promise<GetStaticPathsResult<CollectionPageParams>> {
  const { locales } = getLocale(context)

  const paths = (
    await Promise.all(
      locales.map(async (locale) => {
        const ids = await getCollectionIds(locale)
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
 * Provides collection content, metadata and translations for collection page.
 */
export async function getStaticProps(
  context: GetStaticPropsContext<CollectionPageParams>,
): Promise<GetStaticPropsResult<CollectionPageProps>> {
  const { locale } = getLocale(context)

  const dictionary = await loadDictionary(locale, ['common'])

  const { id } = context.params as CollectionPageParams
  const collection = await getCollectionById(id, locale)
  const lastUpdatedAt = await getLastUpdatedTimestamp(
    getCollectionFilePath(id, locale),
  )

  return {
    props: {
      dictionary,
      collection,
      lastUpdatedAt,
    },
  }
}

/**
 * Collection page.
 */
export default function CollectionPage(
  props: CollectionPageProps,
): JSX.Element {
  const { collection, lastUpdatedAt } = props
  const { metadata } = collection.data

  const canonicalUrl = useCanonicalUrl()
  const languageAlternates = useAlternateUrls()

  return (
    <Fragment>
      <Metadata
        title={metadata.title}
        canonicalUrl={canonicalUrl}
        languageAlternates={languageAlternates}
      />
      <JsonLd
        // TODO:
        schema={{
          '@type': 'Collection',
        }}
      />
      <PageContent className="grid px-10 py-16 mx-auto space-y-10 w-full max-w-screen-lg">
        <Collection collection={collection} lastUpdatedAt={lastUpdatedAt} />
      </PageContent>
    </Fragment>
  )
}
