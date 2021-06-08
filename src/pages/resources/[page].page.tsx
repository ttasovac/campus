import type { ParsedUrlQuery } from 'querystring'

import {
  Accordion,
  AccordionButton,
  AccordionItem,
  AccordionPanel,
} from '@reach/accordion'
import type {
  GetStaticPathsContext,
  GetStaticPathsResult,
  GetStaticPropsContext,
  GetStaticPropsResult,
} from 'next'
import { Fragment } from 'react'

import type { EventPreview } from '@/api/cms/event'
import { getEventIds, getEventPreviews } from '@/api/cms/event'
import type { PostPreview } from '@/api/cms/post'
import { getPostIds, getPostPreviews } from '@/api/cms/post'
import { getEventPreviewsByTagId } from '@/api/cms/queries/event'
import { getPostPreviewsByTagId } from '@/api/cms/queries/post'
import type { Tag } from '@/api/cms/tag'
import { getTags } from '@/api/cms/tag'
import { Svg as ChevronIcon } from '@/assets/icons/chevron.svg'
import type { Page } from '@/cms/paginate'
import { getPageRange, paginate } from '@/cms/paginate'
import { Icon } from '@/common/Icon'
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
import { PostsList } from '@/post/PostsList'
import { TagsList } from '@/post/TagsList'

const pageSize = 12
const tagsPageSize = 50

export interface PostsPageParams extends ParsedUrlQuery {
  page: string
}

export interface PostsPageProps {
  dictionary: Dictionary
  resources: Page<PostPreview | EventPreview>
  tags: Array<Tag & { posts: number }>
}

/**
 * Creates resource (posts and events) pages.
 */
export async function getStaticPaths(
  context: GetStaticPathsContext,
): Promise<GetStaticPathsResult<PostsPageParams>> {
  const { locales } = getLocale(context)

  const paths = (
    await Promise.all(
      locales.map(async (locale) => {
        const postIds = await getPostIds(locale)
        const eventIds = await getEventIds(locale)
        const ids = [...postIds, ...eventIds]
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
 * Provides metadata and translations for resource (posts and events) page.
 */
export async function getStaticProps(
  context: GetStaticPropsContext<PostsPageParams>,
): Promise<GetStaticPropsResult<PostsPageProps>> {
  const { locale } = getLocale(context)

  const dictionary = await loadDictionary(locale, ['common'])

  const page = Number(context.params?.page)
  const allPosts = await getPostPreviews(locale)
  const allEvents = await getEventPreviews(locale)
  const sortedResources: Array<PostPreview | EventPreview> = [
    ...allPosts,
    ...allEvents,
  ].sort((a, b) => (a.date > b.date ? -1 : 1))

  /* eslint-disable-next-line @typescript-eslint/no-non-null-assertion */
  const resources = paginate(sortedResources, pageSize)[page - 1]!

  const tags = await getTags(locale)
  const tagsWithPostCount = (
    await Promise.all(
      tags.map(async (tag) => {
        const postsWithTag = await getPostPreviewsByTagId(tag.id, locale)
        const eventsWithTag = await getEventPreviewsByTagId(tag.id, locale)

        return {
          ...tag,
          posts: postsWithTag.length + eventsWithTag.length,
        }
      }),
    )
  )
    .filter((tag) => tag.posts > 0)
    /** Display only the first page of tags with highest number of posts. */
    .sort((a, b) => (a.posts > b.posts ? -1 : 1))
    .slice(0, tagsPageSize)

  return {
    props: {
      dictionary,
      resources,
      tags: tagsWithPostCount,
    },
  }
}

/**
 * Posts page.
 */
export default function PostsPage(props: PostsPageProps): JSX.Element {
  const { resources: posts, tags } = props

  const { t } = useI18n()
  const canonicalUrl = useCanonicalUrl()
  const languageAlternates = useAlternateUrls()

  return (
    <Fragment>
      <Metadata
        title={t('common.page.resources')}
        canonicalUrl={canonicalUrl}
        languageAlternates={languageAlternates}
      />
      <PageContent className="flex flex-col w-full max-w-screen-xl px-10 py-16 mx-auto space-y-10">
        <h1 className="text-4.5xl font-bold text-center">Resources</h1>
        <TagsFilter tags={tags} />
        <section>
          <PostsList posts={posts.items} />
          <Pagination
            page={posts.page}
            pages={posts.pages}
            href={routes.resources}
          />
        </section>
      </PageContent>
    </Fragment>
  )
}

interface TagsFilterProps {
  tags: PostsPageProps['tags']
}

/**
 * Filter by topic accordion.
 */
function TagsFilter(props: TagsFilterProps): JSX.Element | null {
  const { tags } = props

  if (tags.length === 0) return null

  return (
    <section>
      <Accordion collapsible>
        <AccordionItem>
          <h2 className="flex text-lg text-primary-600">
            <AccordionButton className="flex items-center justify-between flex-1 px-5 py-5 space-x-2 transition border rounded-lg border-neutral-150 hover:shadow-card-md focus-visible:ring focus-visible:ring-primary-600 focus:outline-none">
              <span>Filter by topic</span>
              <Icon icon={ChevronIcon} className="flex-shrink-0 w-4 h-4" />
            </AccordionButton>
          </h2>
          <AccordionPanel>
            <TagsList tags={tags} />
          </AccordionPanel>
        </AccordionItem>
      </Accordion>
    </section>
  )
}
