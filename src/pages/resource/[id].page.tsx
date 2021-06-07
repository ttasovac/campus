import type { ParsedUrlQuery } from 'querystring'

import { JsonLd } from '@stefanprobst/next-page-metadata'
import type {
  GetStaticPathsContext,
  GetStaticPathsResult,
  GetStaticPropsContext,
  GetStaticPropsResult,
} from 'next'
import Link from 'next/link'
import { Fragment } from 'react'

import type { Event as EventData } from '@/api/cms/event'
import { getEventIds, getEventById } from '@/api/cms/event'
import type { Person } from '@/api/cms/person'
import type { Post as PostData } from '@/api/cms/post'
import { getPostById, getPostFilePath, getPostIds } from '@/api/cms/post'
import { getLastUpdatedTimestamp } from '@/api/github'
import { FloatingTableOfContentsButton } from '@/common/FloatingTableOfContentsButton'
import { PageContent } from '@/common/PageContent'
import { TableOfContents } from '@/common/TableOfContents'
import { getLocale } from '@/i18n/getLocale'
import type { Dictionary } from '@/i18n/loadDictionary'
import { loadDictionary } from '@/i18n/loadDictionary'
import { Metadata } from '@/metadata/Metadata'
import { useAlternateUrls } from '@/metadata/useAlternateUrls'
import { useCanonicalUrl } from '@/metadata/useCanonicalUrl'
import { routes } from '@/navigation/routes.config'
import { Post } from '@/post/Post'
import { getFullName } from '@/utils/getFullName'
import type { ISODateString } from '@/utils/ts/aliases'
import { url as siteUrl } from '~/config/site.config'

export interface PostPageParams extends ParsedUrlQuery {
  id: string
}

export interface PostPageProps {
  dictionary: Dictionary
  post: PostData | EventData
  lastUpdatedAt: ISODateString | null
}

/**
 * Creates page for every post.
 */
export async function getStaticPaths(
  context: GetStaticPathsContext,
): Promise<GetStaticPathsResult<PostPageParams>> {
  const { locales } = getLocale(context)

  const paths = (
    await Promise.all(
      locales.map(async (locale) => {
        const postIds = await getPostIds(locale)
        const eventIds = await getEventIds(locale)
        const ids = [...postIds, ...eventIds]

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
 * Provides post content, metadata and translations for post page.
 */
export async function getStaticProps(
  context: GetStaticPropsContext<PostPageParams>,
): Promise<GetStaticPropsResult<PostPageProps>> {
  const { locale } = getLocale(context)

  const dictionary = await loadDictionary(locale, ['common'])

  const { id } = context.params as PostPageParams
  /**
   * FIXME: We map both posts and events to `/resource/:id`, which is not great.
   * It means we could have id clashes, and also requires this conditional
   * acrobatics (because we cannot pass `type` from `getStaticPaths`).
   *
   * Alternatively, generate rewrites in a postbuild script from /resource/some-id to /resource/events/some-id,
   * and put events in a separate src/pages/resources/events/[id].tsx.
   *
   * Better would be `/resource/:content-type/:id`, which would also make it more clear
   * where "events" fit into the data-model (currently they are both content-type and category/source).
   */
  const post =
    /* eslint-disable-next-line @typescript-eslint/no-unnecessary-condition */
    (await getPostById(id, locale)) ?? (await getEventById(id, locale))

  const lastUpdatedAt = await getLastUpdatedTimestamp(
    getPostFilePath(id, locale),
  )

  return {
    props: {
      dictionary,
      post,
      lastUpdatedAt,
    },
  }
}

/**
 * Post page.
 */
export default function PostPage(props: PostPageProps): JSX.Element {
  const { post, lastUpdatedAt } = props
  const { metadata, toc } = post.data

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
          '@type': 'Article',
        }}
      />
      <PageContent className="grid w-full max-w-screen-lg px-10 py-16 mx-auto space-y-10 2xl:space-y-0 2xl:grid-cols-content 2xl:gap-x-10 2xl:max-w-none">
        <aside
          className="sticky hidden w-full max-w-xs max-h-screen px-10 space-y-10 overflow-y-auto text-sm 2xl:justify-self-end top-24 2xl:block text-neutral-500"
          style={{ maxHeight: 'calc(100vh - 100px)' }}
        >
          <CiteAs id={post.id} metadata={metadata} />
          <ReUseConditions />
        </aside>
        <Post post={post} lastUpdatedAt={lastUpdatedAt} />
        {metadata.toc === true && toc.length > 0 ? (
          <Fragment>
            <aside
              className="sticky hidden max-w-xs max-h-screen px-10 overflow-y-auto text-sm top-24 2xl:block text-neutral-500"
              style={{ maxHeight: 'calc(100vh - 100px)' }}
            >
              <TableOfContents
                toc={toc}
                title={
                  <h2 className="text-xs font-bold tracking-wide uppercase text-neutral-600">{`Table of contents`}</h2>
                }
                className="space-y-2"
              />
            </aside>
            <FloatingTableOfContentsButton toc={toc} />
          </Fragment>
        ) : null}
      </PageContent>
    </Fragment>
  )
}

interface CiteAsProps {
  id: PostData['id']
  metadata: PostData['data']['metadata']
}

/**
 * Citation.
 */
function CiteAs(props: CiteAsProps) {
  const citation = getCitation(props.id, props.metadata)

  function onClick() {
    navigator.clipboard.writeText(citation)
  }

  return (
    <div className="space-y-1.5">
      <h2 className="text-xs font-bold tracking-wide uppercase text-neutral-600">
        Cite as
      </h2>
      <p>{citation}</p>
      <button
        onClick={onClick}
        className="px-3 py-1 text-xs font-medium transition border rounded-full border-primary-600 text-primary-600 hover:bg-primary-600 hover:text-white focus:outline-none focus-visible:ring focus-visible:ring-primary-600"
      >
        Copy citation
      </button>
    </div>
  )
}

/**
 * Returns citation.
 */
function getCitation(
  id: PostData['id'],
  metadata: PostData['data']['metadata'],
) {
  function createNameList(persons: Array<Person>) {
    return persons
      .map((person) => getFullName(person.firstName, person.lastName))
      .join(', ')
      .replace(/,(?!.*,)/gim, ' and')
  }

  const authors = createNameList([
    ...metadata.authors,
    ...(metadata.contributors ?? []),
  ])

  const editors =
    Array.isArray(metadata.editors) && metadata.editors.length > 0
      ? `Edited by ${createNameList(metadata.editors)}. `
      : ''

  const date =
    metadata.remote?.date !== undefined && metadata.remote.date.length > 0
      ? metadata.remote.date
      : metadata.date
  const year = ` (${new Date(date).getFullYear()}). `

  const title = metadata.title.slice(-1).match(/[!?]/)
    ? metadata.title + ' '
    : metadata.title + '. '

  const version = metadata.version ? `Version ${metadata.version}. ` : ''

  const publisher =
    metadata.remote?.publisher !== undefined
      ? metadata.remote.publisher + '. '
      : metadata.remote?.url !== undefined
      ? metadata.categories
          .filter((cat) => cat.id !== 'dariah')
          .map((cat) => cat.host) + '. '
      : 'DARIAH-Campus. '

  const contentType = `[${metadata.type.name}]. `

  const url =
    metadata.remote?.url !== undefined
      ? metadata.remote.url
      : String(new URL(routes.resource(id).pathname, siteUrl))

  const citation =
    authors + year + title + version + editors + publisher + contentType + url

  return citation
}

/**
 * Reuse conditions.
 */
function ReUseConditions() {
  return (
    <div className="space-y-1.5">
      <h2 className="text-xs font-bold tracking-wide uppercase text-neutral-600">
        Reuse conditions
      </h2>
      <p>
        Resources hosted on DARIAH-Campus are subjects to the{' '}
        <Link href={routes.docs('dariah-campus-reuse-charter')}>
          <a className="transition text-primary-600 hover:text-primary-700">
            DARIAH-Campus Training Materials Reuse Charter
          </a>
        </Link>
      </p>
    </div>
  )
}
