import type { ParsedUrlQuery } from 'querystring'

import type {
  GetStaticPathsContext,
  GetStaticPathsResult,
  GetStaticPropsContext,
  GetStaticPropsResult,
} from 'next'
import { Fragment } from 'react'

import { getPostPreviewsByTagId } from '@/api/cms/queries/post'
import type { Tag } from '@/api/cms/tag'
import { getTagIds, getTags } from '@/api/cms/tag'
import type { Page } from '@/cms/paginate'
import { getPageRange, paginate } from '@/cms/paginate'
import { PageContent } from '@/common/PageContent'
import { getLocale } from '@/i18n/getLocale'
import type { Dictionary } from '@/i18n/loadDictionary'
import { loadDictionary } from '@/i18n/loadDictionary'
import { useI18n } from '@/i18n/useI18n'
import { Metadata } from '@/metadata/Metadata'
import { useAlternateUrls } from '@/metadata/useAlternateUrls'
import { useCanonicalUrl } from '@/metadata/useCanonicalUrl'
import { TagsList } from '@/post/TagsList'
import { Svg as HeroImage } from '~/public/assets/images/study.svg'

const pageSize = 50

export interface TagsPageParams extends ParsedUrlQuery {
  page: string
}

export interface TagsPageProps {
  dictionary: Dictionary
  tags: Page<Tag & { posts: number }>
}

/**
 * Creates tags pages.
 */
export async function getStaticPaths(
  context: GetStaticPathsContext,
): Promise<GetStaticPathsResult<TagsPageParams>> {
  const { locales } = getLocale(context)

  const paths = (
    await Promise.all(
      locales.map(async (locale) => {
        const ids = await getTagIds(locale)
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
 * Provides metadata and translations for tags page.
 */
export async function getStaticProps(
  context: GetStaticPropsContext<TagsPageParams>,
): Promise<GetStaticPropsResult<TagsPageProps>> {
  const { locale } = getLocale(context)

  const dictionary = await loadDictionary(locale, ['common'])

  const page = Number(context.params?.page)
  /* eslint-disable-next-line @typescript-eslint/no-non-null-assertion */
  const tags = paginate(await getTags(locale))[page - 1]!
  const tagsWithPostCount = (
    await Promise.all(
      tags.items.map(async (tag) => {
        const postsWithTag = await getPostPreviewsByTagId(tag.id, locale)
        return {
          ...tag,
          posts: postsWithTag.length,
        }
      }),
    )
  ).filter((tag) => tag.posts > 0) // FIXME: paginate after filtering - needs caching!

  return {
    props: {
      dictionary,
      tags: { ...tags, items: tagsWithPostCount },
    },
  }
}

/**
 * Tags page.
 */
export default function TagsPage(props: TagsPageProps): JSX.Element {
  const { tags } = props

  const { t } = useI18n()
  const canonicalUrl = useCanonicalUrl()
  const languageAlternates = useAlternateUrls()

  return (
    <Fragment>
      <Metadata
        title={t('common.page.tags')}
        canonicalUrl={canonicalUrl}
        languageAlternates={languageAlternates}
      />
      <PageContent className="flex flex-col max-w-screen-xl px-10 py-16 mx-auto space-y-10 w-full">
        <HeroImage className="h-56 text-primary-600" />
        <h1 className="text-4.5xl font-bold text-center">
          Interested in particular topics?
        </h1>
        <p className="text-lg text-center text-neutral-500">
          Browse learning resources based on their topic
        </p>
        <TagsList tags={tags.items} />
      </PageContent>
    </Fragment>
  )
}
