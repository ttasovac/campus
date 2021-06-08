import type { ParsedUrlQuery } from 'querystring'

import type {
  GetStaticPathsContext,
  GetStaticPathsResult,
  GetStaticPropsContext,
  GetStaticPropsResult,
} from 'next'
import { Fragment } from 'react'

import type { EventPreview } from '@/api/cms/event'
import type { PostPreview } from '@/api/cms/post'
import { getEventPreviewsByTagId } from '@/api/cms/queries/event'
import { getPostPreviewsByTagId } from '@/api/cms/queries/post'
import { getTagById, getTagIds } from '@/api/cms/tag'
import type { Tag as TagData } from '@/api/cms/tag'
import { getPageRange, paginate } from '@/cms/paginate'
import type { Page } from '@/cms/paginate'
import { PageContent } from '@/common/PageContent'
import { Pagination } from '@/common/Pagination'
import { getLocale } from '@/i18n/getLocale'
import type { Dictionary } from '@/i18n/loadDictionary'
import { loadDictionary } from '@/i18n/loadDictionary'
import { Metadata } from '@/metadata/Metadata'
import { useAlternateUrls } from '@/metadata/useAlternateUrls'
import { useCanonicalUrl } from '@/metadata/useCanonicalUrl'
import { routes } from '@/navigation/routes.config'
import { PostsList } from '@/post/PostsList'

const pageSize = 12

export interface TagPageParams extends ParsedUrlQuery {
  id: string
  page: string
}

export interface TagPageProps {
  dictionary: Dictionary
  tag: TagData
  resources: Page<PostPreview | EventPreview>
}

/**
 * Creates page for every tag.
 */
export async function getStaticPaths(
  context: GetStaticPathsContext,
): Promise<GetStaticPathsResult<TagPageParams>> {
  const { locales } = getLocale(context)

  const paths = (
    await Promise.all(
      locales.map(async (locale) => {
        const ids = await getTagIds(locale)
        return (
          await Promise.all(
            ids.map(async (id) => {
              const posts = await getPostPreviewsByTagId(id, locale)
              const events = await getEventPreviewsByTagId(id, locale)
              const resources = [...posts, ...events]

              const pages = getPageRange(resources, pageSize)
              return pages.map((page) => {
                return {
                  params: { id, page: String(page) },
                  locale,
                }
              })
            }),
          )
        ).flat()
      }),
    )
  ).flat()

  return {
    paths,
    fallback: false,
  }
}

/**
 * Provides tag metadata, metadata for posts tagged with that tag and
 * translations for tag page.
 */
export async function getStaticProps(
  context: GetStaticPropsContext<TagPageParams>,
): Promise<GetStaticPropsResult<TagPageProps>> {
  const { locale } = getLocale(context)

  const dictionary = await loadDictionary(locale, ['common'])

  const { id } = context.params as TagPageParams
  const tag = await getTagById(id, locale)

  const page = Number(context.params?.page)
  const posts = await getPostPreviewsByTagId(id, locale)
  const events = await getEventPreviewsByTagId(id, locale)
  const sortedResources: Array<PostPreview | EventPreview> = [
    ...posts,
    ...events,
  ].sort((a, b) => (a.date > b.date ? -1 : 1))

  /* eslint-disable-next-line @typescript-eslint/no-non-null-assertion */
  const resources = paginate(sortedResources, pageSize)[page - 1]!

  return {
    props: {
      dictionary,
      tag,
      resources,
    },
  }
}

/**
 * Tag page.
 */
export default function TagPage(props: TagPageProps): JSX.Element {
  const { tag, resources: posts } = props

  const canonicalUrl = useCanonicalUrl()
  const languageAlternates = useAlternateUrls()

  return (
    <Fragment>
      <Metadata
        title={tag.name}
        canonicalUrl={canonicalUrl}
        languageAlternates={languageAlternates}
      />
      <PageContent className="max-w-screen-xl px-10 py-16 mx-auto space-y-10 w-full">
        <h1 className="text-4.5xl font-bold text-center">{tag.name}</h1>
        <p className="text-center text-neutral-500 text-lg">
          {tag.description}
        </p>
        <section className="space-y-5">
          <h2 className="sr-only">Posts</h2>
          <PostsList posts={posts.items} />
          <Pagination
            page={posts.page}
            pages={posts.pages}
            href={(page) => routes.tag(tag.id, page)}
          />
        </section>
      </PageContent>
    </Fragment>
  )
}
