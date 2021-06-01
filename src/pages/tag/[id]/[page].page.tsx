import type {
  GetStaticPathsContext,
  GetStaticPathsResult,
  GetStaticPropsContext,
  GetStaticPropsResult,
} from 'next'
import { Fragment } from 'react'

import type { PostPreview } from '@/api/cms/post'
import { getPostPreviewsByTagId } from '@/api/cms/queries/post'
import { getTagById, getTagIds } from '@/api/cms/tag'
import type { Tag } from '@/api/cms/tag'
import { getPageRange, paginate } from '@/cms/paginate'
import type { Page } from '@/cms/paginate'
import { PageContent } from '@/common/PageContent'
import { getLocale } from '@/i18n/getLocale'
import type { Dictionary } from '@/i18n/loadDictionary'
import { loadDictionary } from '@/i18n/loadDictionary'
import { Metadata } from '@/metadata/Metadata'
import { useAlternateUrls } from '@/metadata/useAlternateUrls'
import { useCanonicalUrl } from '@/metadata/useCanonicalUrl'
import { PostsList } from '@/post/PostsList'
import { PostsListNav } from '@/post/PostsListNav'

const pageSize = 10

export type TagPageParams = {
  id: string
  page: string
}

export interface TagPageProps {
  dictionary: Dictionary
  tag: Tag
  posts: Page<PostPreview>
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
              const pages = getPageRange(posts, pageSize)
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
  /* eslint-disable-next-line @typescript-eslint/no-non-null-assertion */
  const posts = paginate(await getPostPreviewsByTagId(id, locale))[page - 1]!

  return {
    props: {
      dictionary,
      tag,
      posts,
    },
  }
}

/**
 * Tag page.
 */
export default function TagPage(props: TagPageProps): JSX.Element {
  const { tag, posts } = props

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
          <PostsList posts={posts} />
          <PostsListNav posts={posts} />
        </section>
      </PageContent>
    </Fragment>
  )
}
