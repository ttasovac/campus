import type { ParsedUrlQuery } from 'querystring'

import type {
  GetStaticPathsContext,
  GetStaticPathsResult,
  GetStaticPropsContext,
  GetStaticPropsResult,
} from 'next'
import { Fragment } from 'react'

import type { Docs as DocsData, DocsPreview } from '@/api/cms/docs'
import {
  getDocsById,
  getDocsFilePath,
  getDocsIds,
  getDocsPreviews,
} from '@/api/cms/docs'
import { getLastUpdatedTimestamp } from '@/api/github'
import { FloatingTableOfContentsButton } from '@/common/FloatingTableOfContentsButton'
import { NavLink } from '@/common/NavLink'
import { PageContent } from '@/common/PageContent'
import { TableOfContents } from '@/common/TableOfContents'
import { getLocale } from '@/i18n/getLocale'
import type { Dictionary } from '@/i18n/loadDictionary'
import { loadDictionary } from '@/i18n/loadDictionary'
import { useI18n } from '@/i18n/useI18n'
import { Mdx as DocsContent } from '@/mdx/Mdx'
import { Metadata } from '@/metadata/Metadata'
import { useAlternateUrls } from '@/metadata/useAlternateUrls'
import { useCanonicalUrl } from '@/metadata/useCanonicalUrl'
import { routes } from '@/navigation/routes.config'
import type { ISODateString } from '@/utils/ts/aliases'

export interface DocsPageParams extends ParsedUrlQuery {
  id: string
}

export interface DocsPageProps {
  dictionary: Dictionary
  docs: DocsData
  lastUpdatedAt: ISODateString | null
  nav: Array<DocsPreview>
}

/**
 * Creates docs pages.
 */
export async function getStaticPaths(
  context: GetStaticPathsContext,
): Promise<GetStaticPathsResult<DocsPageParams>> {
  const { locales } = getLocale(context)

  const paths = (
    await Promise.all(
      locales.map(async (locale) => {
        const ids = await getDocsIds(locale)
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
 * Provides translations for docs page.
 */
export async function getStaticProps(
  context: GetStaticPropsContext<DocsPageParams>,
): Promise<GetStaticPropsResult<DocsPageProps>> {
  const { locale } = getLocale(context)

  const dictionary = await loadDictionary(locale, ['common'])

  const { id } = context.params as DocsPageParams
  const docs = await getDocsById(id, locale)
  const lastUpdatedAt = await getLastUpdatedTimestamp(
    getDocsFilePath(id, locale),
  )

  const nav = await getDocsPreviews(locale)

  return {
    props: {
      dictionary,
      docs,
      lastUpdatedAt,
      nav,
    },
  }
}

/**
 * Docs page.
 */
export default function DocsPage(props: DocsPageProps): JSX.Element {
  const { docs, lastUpdatedAt, nav } = props
  const { metadata, toc } = docs.data

  const canonicalUrl = useCanonicalUrl()
  const languageAlternates = useAlternateUrls()

  return (
    <Fragment>
      <Metadata
        title={metadata.title}
        canonicalUrl={canonicalUrl}
        languageAlternates={languageAlternates}
      />
      <PageContent className="max-w-screen-lg px-6 py-24 mx-auto space-y-24 w-full grid 2xl:grid-cols-content 2xl:space-y-0 2xl:gap-x-10 2xl:max-w-none">
        <aside className="space-y-2 text-sm text-neutral-500 max-w-xs w-full hidden 2xl:block 2xl:justify-self-end">
          <DocsNav nav={nav} />
        </aside>
        <Docs docs={docs} lastUpdatedAt={lastUpdatedAt} nav={nav} />
        {toc.length > 0 ? (
          <Fragment>
            <aside
              className="max-w-xs sticky hidden max-h-screen px-10 overflow-y-auto text-sm top-24 2xl:block text-neutral-500"
              style={{
                maxHeight:
                  'calc(100vh - 12px - var(--page-header-height, 100px))',
              }}
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

interface DocsProps {
  docs: DocsPageProps['docs']
  lastUpdatedAt: DocsPageProps['lastUpdatedAt']
  nav: DocsPageProps['nav']
}

function Docs(props: DocsProps) {
  const { docs, lastUpdatedAt, nav } = props
  const { metadata } = docs.data

  const { formatDate } = useI18n()

  return (
    <article className="space-y-16 max-w-80ch w-full mx-auto">
      <header className="space-y-10">
        <h1 className="font-bold text-4.5xl text-center">{metadata.title}</h1>
        <div className="2xl:hidden text-neutral-500 border-l-4 border-neutral-500 pl-4">
          <DocsNav nav={nav} />
        </div>
      </header>
      <div className="prose max-w-none">
        <DocsContent code={docs.code} />
      </div>
      <footer>
        {lastUpdatedAt != null ? (
          <p className="text-right text-neutral-500 text-sm">
            <span>Last updated: </span>
            <time dateTime={lastUpdatedAt}>
              {formatDate(new Date(lastUpdatedAt), undefined, {
                dateStyle: 'medium',
              })}
            </time>
          </p>
        ) : null}
      </footer>
    </article>
  )
}

interface DocsNavProps {
  nav: DocsPageProps['nav']
}

function DocsNav(props: DocsNavProps) {
  return (
    <nav aria-label="Documentation" className="space-y-2">
      <h2 className="text-xs font-bold tracking-wide uppercase text-neutral-600">{`Documentation overview`}</h2>
      <ul className="space-y-1.5">
        {props.nav.map((page) => {
          return (
            <li key={page.id}>
              <NavLink
                href={routes.docs(page.id)}
                className="hover:text-primary-600 flex transition focus:outline-none focus-visible:ring focus-visible:ring-primary-600 rounded"
                activeClassName="font-bold pointer-events-none"
              >
                {page.title}
              </NavLink>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
