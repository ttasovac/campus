import '@reach/dialog/styles.css'

import type { ParsedUrlQuery } from 'querystring'

import { DialogContent, DialogOverlay } from '@reach/dialog'
import { JsonLd } from '@stefanprobst/next-page-metadata'
import type {
  GetStaticPathsContext,
  GetStaticPathsResult,
  GetStaticPropsContext,
  GetStaticPropsResult,
} from 'next'
import Link from 'next/link'
import { Fragment } from 'react'

import type { Post as PostData } from '@/api/cms/post'
import { getPostById, getPostFilePath, getPostIds } from '@/api/cms/post'
import { getLastUpdatedTimestamp } from '@/api/github'
import { Svg as MenuIcon } from '@/assets/icons/menu.svg'
import { Icon } from '@/common/Icon'
import { PageContent } from '@/common/PageContent'
import { useDialogState } from '@/common/useDialogState'
import { getLocale } from '@/i18n/getLocale'
import type { Dictionary } from '@/i18n/loadDictionary'
import { loadDictionary } from '@/i18n/loadDictionary'
import { Metadata } from '@/metadata/Metadata'
import { useAlternateUrls } from '@/metadata/useAlternateUrls'
import { useCanonicalUrl } from '@/metadata/useCanonicalUrl'
import { Post } from '@/post/Post'
import type { TableOfContentsProps } from '@/post/TableOfContents'
import { TableOfContents } from '@/post/TableOfContents'
import type { ISODateString } from '@/utils/ts/aliases'

export interface PostPageParams extends ParsedUrlQuery {
  id: string
}

export interface PostPageProps {
  dictionary: Dictionary
  post: PostData
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
        const ids = await getPostIds(locale)
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
  const post = await getPostById(id, locale)
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
      <PageContent className="grid px-10 py-16 mx-auto space-y-10 2xl:space-y-0 2xl:grid-cols-content 2xl:gap-x-10 w-full max-w-screen-lg 2xl:max-w-none">
        <aside
          className="sticky hidden max-h-screen px-10 space-y-10 overflow-y-auto text-sm top-24 2xl:block text-neutral-500"
          style={{ maxHeight: 'calc(100vh - 100px)' }}
        >
          <CiteAs metadata={metadata} />
          <ReUseConditions />
        </aside>
        <Post post={post} lastUpdatedAt={lastUpdatedAt} />
        {metadata.toc === true && toc.length > 0 ? (
          <Fragment>
            <aside
              className="sticky hidden max-h-screen px-10 overflow-y-auto text-sm top-24 2xl:block text-neutral-500"
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

interface FloatingTableOfContentsButtonProps {
  toc: TableOfContentsProps['toc']
}

/**
 * Floating table of contents.
 */
function FloatingTableOfContentsButton(
  props: FloatingTableOfContentsButtonProps,
) {
  const state = useDialogState()

  return (
    <Fragment>
      <button
        onClick={state.toggle}
        className="fixed p-4 text-white transition rounded-full bottom-5 right-5 hover:bg-primary-700 bg-primary-600 2xl:hidden focus:outline-none focus-visible:ring focus-visible:ring-primary-600"
      >
        <Icon icon={MenuIcon} className="w-5 h-5" />
        <span className="sr-only">Table of contents</span>
      </button>
      <DialogOverlay
        isOpen={state.isOpen}
        onDismiss={state.close}
        className="z-10"
      >
        <DialogContent
          aria-label="Table of contents"
          className="rounded-xl shadow-card"
        >
          <TableOfContents
            toc={props.toc}
            title={
              <h2 className="text-sm font-bold tracking-wide uppercase text-neutral-600">{`Table of contents`}</h2>
            }
            className="space-y-2"
          />
        </DialogContent>
      </DialogOverlay>
    </Fragment>
  )
}

interface CiteAsProps {
  metadata: PostData['data']['metadata']
}

/**
 * Citation.
 */
function CiteAs(props: CiteAsProps) {
  const citation = getCitation(props.metadata)

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

function getCitation(metadata: PostData['data']['metadata']) {
  return metadata.title
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
        <Link href={{ pathname: '/docs/dariah-campus-reuse-charter' }}>
          <a className="transition text-primary-600 hover:text-primary-700">
            DARIAH-Campus Training Materials Reuse Charter
          </a>
        </Link>
      </p>
    </div>
  )
}
