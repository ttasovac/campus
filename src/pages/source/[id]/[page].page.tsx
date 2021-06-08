import type { ParsedUrlQuery } from 'querystring'

import type {
  GetStaticPathsContext,
  GetStaticPathsResult,
  GetStaticPropsContext,
  GetStaticPropsResult,
} from 'next'
import { Fragment } from 'react'

import { getCategoryById, getCategoryIds } from '@/api/cms/category'
import type { Category as CategoryData } from '@/api/cms/category'
import type { PostPreview } from '@/api/cms/post'
import { getPostPreviewsByCategoryId } from '@/api/cms/queries/post'
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

export interface CategoryPageParams extends ParsedUrlQuery {
  id: string
  page: string
}

export interface CategoryPageProps {
  dictionary: Dictionary
  category: CategoryData
  posts: Page<PostPreview>
}

/**
 * Creates page for every category.
 */
export async function getStaticPaths(
  context: GetStaticPathsContext,
): Promise<GetStaticPathsResult<CategoryPageParams>> {
  const { locales } = getLocale(context)

  const paths = (
    await Promise.all(
      locales.map(async (locale) => {
        const ids = await getCategoryIds(locale)
        return (
          await Promise.all(
            ids.map(async (id) => {
              const posts = await getPostPreviewsByCategoryId(id, locale)
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
 * Provides category metadata, metadata for posts in that category and
 * translations for category page.
 */
export async function getStaticProps(
  context: GetStaticPropsContext<CategoryPageParams>,
): Promise<GetStaticPropsResult<CategoryPageProps>> {
  const { locale } = getLocale(context)

  const dictionary = await loadDictionary(locale, ['common'])

  const { id } = context.params as CategoryPageParams
  const category = await getCategoryById(id, locale)

  const page = Number(context.params?.page)
  /* eslint-disable-next-line @typescript-eslint/no-non-null-assertion */
  const posts = paginate(
    await getPostPreviewsByCategoryId(id, locale),
    pageSize,
  )[page - 1]!

  return {
    props: {
      dictionary,
      category,
      posts,
    },
  }
}

/**
 * Category page.
 */
export default function CategoryPage(props: CategoryPageProps): JSX.Element {
  const { category, posts } = props

  const canonicalUrl = useCanonicalUrl()
  const languageAlternates = useAlternateUrls()

  return (
    <Fragment>
      <Metadata
        title={category.name}
        canonicalUrl={canonicalUrl}
        languageAlternates={languageAlternates}
      />
      <PageContent className="max-w-screen-xl px-10 py-16 mx-auto space-y-10 w-full">
        <h1 className="text-4.5xl font-bold text-center">{category.name}</h1>
        <p className="text-center text-neutral-500 text-lg">
          {category.description}
        </p>
        <section className="space-y-5">
          <h2 className="sr-only">Posts</h2>
          <PostsList posts={posts.items} />
          <Pagination
            page={posts.page}
            pages={posts.pages}
            href={(page) => routes.source(category.id, page)}
          />
        </section>
      </PageContent>
    </Fragment>
  )
}
