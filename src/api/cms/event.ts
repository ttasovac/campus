import { join } from 'path'

import type { Toc } from '@stefanprobst/rehype-extract-toc'
import withExtractedTableOfContents from '@stefanprobst/rehype-extract-toc'
import withSyntaxHighlighting from '@stefanprobst/rehype-shiki'
import withHeadingIds from 'rehype-slug'
import withFootnotes from 'remark-footnotes'
import withGitHubMarkdown from 'remark-gfm'
import type { VFile } from 'vfile'
import vfile from 'vfile'

import type { Category, CategoryId } from '@/api/cms/category'
import { getCategoryById } from '@/api/cms/category'
import type { ContentType } from '@/api/cms/contentType'
import { getContentTypeById } from '@/api/cms/contentType'
import type { Person, PersonId } from '@/api/cms/person'
import { getPersonById } from '@/api/cms/person'
import type { Tag, TagId } from '@/api/cms/tag'
import { getTagById } from '@/api/cms/tag'
import type { Locale } from '@/i18n/i18n.config'
import { extractFrontmatter } from '@/mdx/extractFrontmatter'
import minify from '@/mdx/plugins/recma-minify'
import withHeadingLinks from '@/mdx/plugins/rehype-heading-links'
import withImageCaptions from '@/mdx/plugins/rehype-image-captions'
import withLazyLoadingImages from '@/mdx/plugins/rehype-lazy-loading-images'
import withNoReferrerLinks from '@/mdx/plugins/rehype-no-referrer-links'
import { readFile } from '@/mdx/readFile'
import { readFolder } from '@/mdx/readFolder'
import type { FilePath, ISODateString, URLString } from '@/utils/ts/aliases'

const eventsFolder = join(process.cwd(), 'content', 'events')
const eventsExtension = '.mdx'

export interface EventId {
  /** Slug. */
  id: string
}

type ID = EventId['id']

export interface EventFrontmatter {
  uuid: string
  title: string
  shortTitle?: string
  eventType?: string
  lang: 'en' | 'de'
  date: ISODateString
  authors?: Array<PersonId['id']>
  // version: string
  licence: 'ccby-4.0'
  logo?: FilePath
  featuredImage?: FilePath
  tags: Array<TagId['id']>
  categories: Array<'event'> //Array<CategoryId['id']>
  abstract: string
  type: 'event' // ContentTypeId['id']

  about: string
  prep?: string

  partners?: Array<{ name: string; logo?: FilePath; url?: URLString }>
  social?: {
    website?: URLString
    email?: string
    twitter?: string
    flickr?: URLString
  }
  synthesis?: FilePath
  sessions: Array<EventSessionFrontmatter>
}

export interface EventSessionFrontmatter {
  title: string
  // shortTitle?: string
  speakers: Array<PersonId['id']>
  body: string
  synthesis?: FilePath
}

export interface EventMetadata
  extends Omit<
    EventFrontmatter,
    'authors' | 'categories' | 'tags' | 'type' | 'about' | 'prep' | 'sessions'
  > {
  authors: Array<Person>
  categories: Array<Category>
  tags: Array<Tag>
  type: ContentType
  sessions: Array<EventSessionMetadata>

  about: { code: string }
  prep: { code: string } | null
}

export interface EventSessionMetadata {
  title: string
  // shortTitle?: string
  speakers: Array<Person>
  body: { code: string }
  synthesis?: FilePath
}

export interface EventData {
  /** Metadata. */
  metadata: EventMetadata
  /** Table of contents. */
  toc: Toc
}

export interface Event extends EventId {
  /** Metadata and table of contents. */
  data: EventData
  /** Mdx compiled to function body. Must be hydrated on the client with `useMdx`. */
  code: string
}

export interface EventPreview extends EventId, EventMetadata {}

/**
 * Returns all post ids (slugs).
 */
export async function getEventIds(_locale: Locale): Promise<Array<string>> {
  const ids = await readFolder(eventsFolder, eventsExtension)

  return ids
}

/**
 * Returns post content, table of contents, and metadata.
 */
export async function getEventById(id: ID, locale: Locale): Promise<Event> {
  const file = await getEventFile(id, locale)
  const metadata = await getEventMetadata(file, locale)
  const code = String(await compileMdx(file))

  const data = {
    metadata,
    toc: (file.data as { toc: Toc }).toc,
  }

  return {
    id,
    data,
    code,
  }
}

/**
 * Returns all posts, sorted by date.
 */
export async function getEvents(locale: Locale): Promise<Array<Event>> {
  const ids = await getEventIds(locale)

  const posts = await Promise.all(
    ids.map(async (id) => {
      return getEventById(id, locale)
    }),
  )

  posts.sort((a, b) =>
    a.data.metadata.date === b.data.metadata.date
      ? 0
      : a.data.metadata.date > b.data.metadata.date
      ? -1
      : 1,
  )

  return posts
}

/**
 * Returns metadata for post.
 */
export async function getEventPreviewById(
  id: ID,
  locale: Locale,
): Promise<EventPreview> {
  const file = await getEventFile(id, locale)
  const metadata = await getEventMetadata(file, locale)

  return { id, ...metadata }
}

/**
 * Returns metadata for all posts, sorted by date.
 */
export async function getEventPreviews(
  locale: Locale,
): Promise<Array<EventPreview>> {
  const ids = await getEventIds(locale)

  const metadata = await Promise.all(
    ids.map(async (id) => {
      return getEventPreviewById(id, locale)
    }),
  )

  metadata.sort((a, b) => (a.date === b.date ? 0 : a.date > b.date ? -1 : 1))

  return metadata
}

/**
 * Reads post file.
 */
async function getEventFile(id: ID, locale: Locale): Promise<VFile> {
  const filePath = getEventFilePath(id, locale)
  const file = await readFile(filePath)

  return file
}

/**
 * Returns file path for post.
 */
export function getEventFilePath(id: ID, _locale: Locale): FilePath {
  const filePath = join(eventsFolder, id + eventsExtension)

  return filePath
}

/**
 * Extracts post metadata and resolves foreign-key relations.
 */
async function getEventMetadata(
  file: VFile,
  locale: Locale,
): Promise<EventMetadata> {
  const matter = await getEventFrontmatter(file, locale)

  const metadata = {
    ...matter,
    authors: Array.isArray(matter.authors)
      ? await Promise.all(
          matter.authors.map((id) => {
            return getPersonById(id, locale)
          }),
        )
      : [],
    tags: Array.isArray(matter.tags)
      ? await Promise.all(
          matter.tags.map((id) => {
            return getTagById(id, locale)
          }),
        )
      : [],
    categories: Array.isArray(matter.categories)
      ? await Promise.all(
          matter.categories.map((id) => {
            return getCategoryById(id, locale)
          }),
        )
      : [],
    type: await getContentTypeById(matter.type, locale),
    sessions: await Promise.all(
      matter.sessions.map(async (session) => {
        const speakers = await Promise.all(
          session.speakers.map((id) => {
            return getPersonById(id, locale)
          }),
        )

        const code = String(await compileMdx(vfile({ contents: session.body })))

        return {
          ...session,
          speakers,
          body: { code },
        }
      }),
    ),

    about: {
      code: String(await compileMdx(vfile({ contents: matter.about }))),
    },
    prep:
      matter.prep != null
        ? { code: String(await compileMdx(vfile({ contents: matter.prep }))) }
        : null,
  }

  return metadata
}

/**
 * Extracts post frontmatter.
 */
async function getEventFrontmatter(
  file: VFile,
  _locale: Locale,
): Promise<EventFrontmatter> {
  extractFrontmatter(file)

  const { matter } = file.data as { matter: EventFrontmatter }

  return matter
}

/**
 * Compiles markdown and mdx content to function body.
 * Must be hydrated on the client with `useMdx`.
 *
 * Treats `.md` files as markdown, and `.mdx` files as mdx.
 *
 * Supports CommonMark, GitHub Markdown, and Pandoc Footnotes.
 */
async function compileMdx(file: VFile): Promise<VFile> {
  const { compile } = await import('xdm')

  return compile(file, {
    outputFormat: 'function-body',
    useDynamicImport: false,
    remarkPlugins: [withGitHubMarkdown, withFootnotes],
    rehypePlugins: [
      [withSyntaxHighlighting, { theme: 'material-palenight' }],
      withHeadingIds,
      withExtractedTableOfContents,
      withHeadingLinks,
      withNoReferrerLinks,
      withLazyLoadingImages,
      withImageCaptions,
    ],
    // recmaPlugins: [minify], // FIXME:
  })
}
