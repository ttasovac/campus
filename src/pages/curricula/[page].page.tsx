import type { ParsedUrlQuery } from 'querystring'

import type {
  GetStaticPathsContext,
  GetStaticPathsResult,
  GetStaticPropsContext,
  GetStaticPropsResult,
} from 'next'
import { Fragment } from 'react'

import type { CollectionPreview } from '@/api/cms/collection'
import { getCollectionIds, getCollectionPreviews } from '@/api/cms/collection'
import type { Page } from '@/cms/paginate'
import { getPageRange, paginate } from '@/cms/paginate'
import { PageContent } from '@/common/PageContent'
import { Pagination } from '@/common/Pagination'
import { getLocale } from '@/i18n/getLocale'
import type { Dictionary } from '@/i18n/loadDictionary'
import { loadDictionary } from '@/i18n/loadDictionary'
import { useI18n } from '@/i18n/useI18n'
import { Metadata } from '@/metadata/Metadata'
import { useAlternateUrls } from '@/metadata/useAlternateUrls'
import { useCanonicalUrl } from '@/metadata/useCanonicalUrl'
import { routes } from '@/navigation/routes.config'
import { CollectionsList } from '@/post/CollectionsList'

const pageSize = 10

export interface CollectionsPageParams extends ParsedUrlQuery {
  page: string
}

export interface CollectionsPageProps {
  dictionary: Dictionary
  collections: Page<CollectionPreview>
}

/**
 * Creates posts pages.
 */
export async function getStaticPaths(
  context: GetStaticPathsContext,
): Promise<GetStaticPathsResult<CollectionsPageParams>> {
  const { locales } = getLocale(context)

  const paths = (
    await Promise.all(
      locales.map(async (locale) => {
        const ids = await getCollectionIds(locale)
        const pages = getPageRange(ids, pageSize)
        return pages.map((page) => {
          return {
            params: { page: String(page) },
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
 * Provides metadata and translations for collections page.
 */
export async function getStaticProps(
  context: GetStaticPropsContext<CollectionsPageParams>,
): Promise<GetStaticPropsResult<CollectionsPageProps>> {
  const { locale } = getLocale(context)

  const dictionary = await loadDictionary(locale, ['common'])

  const page = Number(context.params?.page)
  /* eslint-disable-next-line @typescript-eslint/no-non-null-assertion */
  const collections = paginate(await getCollectionPreviews(locale))[page - 1]!

  return {
    props: {
      dictionary,
      collections,
    },
  }
}

/**
 * Collections page.
 */
export default function CollectionsPage(
  props: CollectionsPageProps,
): JSX.Element {
  const { collections } = props

  const { t } = useI18n()
  const canonicalUrl = useCanonicalUrl()
  const languageAlternates = useAlternateUrls()

  return (
    <Fragment>
      <Metadata
        title={t('common.page.collections')}
        canonicalUrl={canonicalUrl}
        languageAlternates={languageAlternates}
      />
      <PageContent className="flex flex-col max-w-screen-xl px-10 py-16 mx-auto space-y-10 w-full">
        <h1 className="text-4.5xl font-bold text-center">Curricula</h1>
        <section>
          <CollectionsList collections={collections.items} />
          <Pagination
            page={collections.page}
            pages={collections.pages}
            href={routes.collections}
          />
        </section>
      </PageContent>
    </Fragment>
  )
}
