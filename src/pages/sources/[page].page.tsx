import type {
  GetStaticPathsContext,
  GetStaticPathsResult,
  GetStaticPropsContext,
  GetStaticPropsResult,
} from 'next'
import Link from 'next/link'
import { Fragment } from 'react'

import type { Category } from '@/api/cms/category'
import { getCategories, getCategoryIds } from '@/api/cms/category'
import { getPostPreviewsByCategoryId } from '@/api/cms/queries/post'
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
import { routes } from '@/navigation/routes.config'

const pageSize = 10

export type CategoriesPageParams = {
  page: string
}

export interface CategoriesPageProps {
  dictionary: Dictionary
  categories: Page<Category & { posts: number }>
}

/**
 * Creates categories pages.
 */
export async function getStaticPaths(
  context: GetStaticPathsContext,
): Promise<GetStaticPathsResult<CategoriesPageParams>> {
  const { locales } = getLocale(context)

  const paths = (
    await Promise.all(
      locales.map(async (locale) => {
        const ids = await getCategoryIds(locale)
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
 * Provides metadata and translations for categories page.
 */
export async function getStaticProps(
  context: GetStaticPropsContext<CategoriesPageParams>,
): Promise<GetStaticPropsResult<CategoriesPageProps>> {
  const { locale } = getLocale(context)

  const dictionary = await loadDictionary(locale, ['common'])

  const page = Number(context.params?.page)
  /* eslint-disable-next-line @typescript-eslint/no-non-null-assertion */
  const categories = paginate(await getCategories(locale))[page - 1]!
  const categoriesWithPostCount = (
    await Promise.all(
      categories.items.map(async (category) => {
        const postsWithCategory = await getPostPreviewsByCategoryId(
          category.id,
          locale,
        )
        return {
          ...category,
          posts: postsWithCategory.length,
        }
      }),
    )
  ).filter((category) => category.posts > 0) // FIXME: paginate after filtering - needs caching!

  return {
    props: {
      dictionary,
      categories: { ...categories, items: categoriesWithPostCount },
    },
  }
}

/**
 * Categories page.
 */
export default function CategoriesPage(
  props: CategoriesPageProps,
): JSX.Element {
  const { categories } = props

  const { t } = useI18n()
  const canonicalUrl = useCanonicalUrl()
  const languageAlternates = useAlternateUrls()

  return (
    <Fragment>
      <Metadata
        title={t('common.page.sources')}
        canonicalUrl={canonicalUrl}
        languageAlternates={languageAlternates}
      />
      <PageContent className="flex flex-col max-w-screen-xl px-10 py-16 mx-auto space-y-10 w-full">
        <h1 className="text-4.5xl font-bold text-center">Sources</h1>
        <p className="text-neutral-500 text-lg text-center">
          DARIAH learning resources don&apos;t all live in one place. Here you
          can explore our materials based on the context in which they were
          produced.
        </p>
        <section>
          <ul className="grid lg:grid-cols-2">
            {categories.items.map((category) => {
              return (
                <li key={category.id}>
                  <article className="rounded-xl shadow-card-md overflow-hidden">
                    {category.image !== undefined ? (
                      <img src={category.image} alt="" loading="lazy" />
                    ) : null}
                    <div className="p-10 space-y-4">
                      <h2 className="font-bold text-2xl">{category.name}</h2>
                      <p className="leading-7">{category.description}</p>
                    </div>
                    <footer className="flex items-center justify-between p-8 bg-neutral-100">
                      <span className="px-2">{category.posts} Resources</span>
                      <Link href={routes.source(category.id)}>
                        <a className="hover:text-primary-600 px-2 transition rounded focus:outline-none focus-visible:ring focus-visible:ring-primary-600">
                          Read more &rarr;
                        </a>
                      </Link>
                    </footer>
                  </article>
                </li>
              )
            })}
          </ul>
        </section>
      </PageContent>
    </Fragment>
  )
}
