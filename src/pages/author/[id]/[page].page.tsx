import type {
  GetStaticPathsContext,
  GetStaticPathsResult,
  GetStaticPropsContext,
  GetStaticPropsResult,
} from 'next'
import { Fragment } from 'react'

import type { Person } from '@/api/cms/person'
import { getPersonById, getPersonIds } from '@/api/cms/person'
import type { PostPreview } from '@/api/cms/post'
import { getPostPreviewsByAuthorId } from '@/api/cms/queries/post'
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

export type AuthorPageParams = {
  id: string
  page: string
}

export interface AuthorPageProps {
  dictionary: Dictionary
  author: Person
  posts: Page<PostPreview>
}

/**
 * Creates page for every person.
 */
export async function getStaticPaths(
  context: GetStaticPathsContext,
): Promise<GetStaticPathsResult<AuthorPageParams>> {
  const { locales } = getLocale(context)

  const paths = (
    await Promise.all(
      locales.map(async (locale) => {
        const ids = await getPersonIds(locale)
        return (
          await Promise.all(
            ids.map(async (id) => {
              const posts = await getPostPreviewsByAuthorId(id, locale)
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
 * Provides person metadata, metadata for posts authored by that person and
 * translations for person page.
 */
export async function getStaticProps(
  context: GetStaticPropsContext<AuthorPageParams>,
): Promise<GetStaticPropsResult<AuthorPageProps>> {
  const { locale } = getLocale(context)

  const dictionary = await loadDictionary(locale, ['common'])

  const { id } = context.params as AuthorPageParams
  const author = await getPersonById(id, locale)

  const page = Number(context.params?.page)
  /* eslint-disable-next-line @typescript-eslint/no-non-null-assertion */
  const posts = paginate(await getPostPreviewsByAuthorId(id, locale))[page - 1]!

  return {
    props: {
      dictionary,
      author,
      posts,
    },
  }
}

/**
 * Author page.
 */
export default function AuthorPage(props: AuthorPageProps): JSX.Element {
  const { author, posts } = props

  const canonicalUrl = useCanonicalUrl()
  const languageAlternates = useAlternateUrls()

  const fullName = [author.firstName, author.lastName].filter(Boolean).join(' ')

  return (
    <Fragment>
      <Metadata
        title={fullName}
        canonicalUrl={canonicalUrl}
        languageAlternates={languageAlternates}
      />
      <PageContent className="max-w-screen-xl px-10 py-16 mx-auto space-y-10 w-full">
        <h1 className="text-4.5xl font-bold text-center">{fullName}</h1>
        <p className="text-center text-neutral-500 text-lg">
          {author.description}
        </p>
        <dl>
          {author.email !== undefined ? (
            <div>
              <dt>Email</dt>
              <dd>{author.email}</dd>
            </div>
          ) : null}
          {author.website !== undefined ? (
            <div>
              <dt>Website</dt>
              <dd>{author.website}</dd>
            </div>
          ) : null}
          {author.twitter !== undefined ? (
            <div>
              <dt>Twitter</dt>
              <dd>{author.twitter}</dd>
            </div>
          ) : null}
          {author.orcid !== undefined ? (
            <div>
              <dt>ORCID</dt>
              <dd>{author.orcid}</dd>
            </div>
          ) : null}
          {author.linkedin !== undefined ? (
            <div>
              <dt>LinkedIn</dt>
              <dd>{author.linkedin}</dd>
            </div>
          ) : null}
        </dl>
        <section className="space-y-5">
          <h2 className="sr-only">Posts</h2>
          <PostsList posts={posts} />
          <PostsListNav posts={posts} />
        </section>
      </PageContent>
    </Fragment>
  )
}
