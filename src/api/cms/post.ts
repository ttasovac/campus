import { join } from 'path'

import type { Toc } from '@stefanprobst/rehype-extract-toc'
import withExtractedTableOfContents from '@stefanprobst/rehype-extract-toc'
import withSyntaxHighlighting from '@stefanprobst/rehype-shiki'
import withHeadingIds from 'rehype-slug'
import withFootnotes from 'remark-footnotes'
import withGitHubMarkdown from 'remark-gfm'
import type { VFile } from 'vfile'

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
import type { FilePath, ISODateString } from '@/utils/ts/aliases'

const postsFolder = join(process.cwd(), 'content', 'resources')
const postExtension = '.mdx'

export interface PostId {
  /** Slug. */
  id: string
}

type ID = PostId['id']

export interface PostFrontmatter {
  uuid: string
  title: string
  shortTitle?: string
  lang: 'en' | 'de'
  date: ISODateString
  authors: Array<PersonId['id']>
  contributors?: Array<PersonId['id']>
  editors?: Array<PersonId['id']>
  version: string
  licence: 'ccby-4.0'
  featuredImage?: FilePath
  tags: Array<TagId['id']>
  categories: Array<CategoryId['id']>
  abstract: string
  domain?: 'Social Sciences and Humanities'
  targetGroup?:
    | 'Data managers'
    | 'Domain researchers'
    | 'Data service engineers'
    | 'Data scientists/analysts'
  type: // ContentTypeId['id']
  | 'audio'
    | 'event'
    | 'slides'
    | 'training module'
    | 'video'
    | 'webinar recording'
    | 'website'
    | 'pathfinder'
  remote?: {
    publisher?: string
    date?: ISODateString
    url?: string
  }
  toc?: boolean
}

export interface PostMetadata
  extends Omit<
    PostFrontmatter,
    'authors' | 'editors' | 'contributors' | 'tags' | 'categories' | 'type'
  > {
  authors: Array<Person>
  contributors?: Array<Person>
  editors?: Array<Person>
  tags: Array<Tag>
  categories: Array<Category>
  type: ContentType
}

export interface PostData {
  /** Metadata. */
  metadata: PostMetadata
  /** Table of contents. */
  toc: Toc
}

export interface Post extends PostId {
  /** Metadata and table of contents. */
  data: PostData
  /** Mdx compiled to function body. Must be hydrated on the client with `useMdx`. */
  code: string
}

export interface PostPreview extends PostId, PostMetadata {}

/**
 * Returns all post ids (slugs).
 */
export async function getPostIds(_locale: Locale): Promise<Array<string>> {
  const ids = await readFolder(postsFolder, postExtension)

  return ids
}

/**
 * Returns post content, table of contents, and metadata.
 */
export async function getPostById(id: ID, locale: Locale): Promise<Post> {
  const file = await getPostFile(id, locale)
  const metadata = await getPostMetadata(file, locale)
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
export async function getPosts(locale: Locale): Promise<Array<Post>> {
  const ids = await getPostIds(locale)

  const posts = await Promise.all(
    ids.map(async (id) => {
      return getPostById(id, locale)
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
export async function getPostPreviewById(
  id: ID,
  locale: Locale,
): Promise<PostPreview> {
  const file = await getPostFile(id, locale)
  const metadata = await getPostMetadata(file, locale)

  return { id, ...metadata }
}

/**
 * Returns metadata for all posts, sorted by date.
 */
export async function getPostPreviews(
  locale: Locale,
): Promise<Array<PostPreview>> {
  const ids = await getPostIds(locale)

  const metadata = await Promise.all(
    ids.map(async (id) => {
      return getPostPreviewById(id, locale)
    }),
  )

  metadata.sort((a, b) => (a.date === b.date ? 0 : a.date > b.date ? -1 : 1))

  return metadata
}

/**
 * Reads post file.
 */
async function getPostFile(id: ID, locale: Locale): Promise<VFile> {
  const filePath = getPostFilePath(id, locale)
  const file = await readFile(filePath)

  return file
}

/**
 * Returns file path for post.
 */
export function getPostFilePath(id: ID, _locale: Locale): FilePath {
  const filePath = join(postsFolder, id + postExtension)

  return filePath
}

/**
 * Extracts post metadata and resolves foreign-key relations.
 */
async function getPostMetadata(
  file: VFile,
  locale: Locale,
): Promise<PostMetadata> {
  const matter = await getPostFrontmatter(file, locale)

  const metadata = {
    ...matter,
    authors: Array.isArray(matter.authors)
      ? await Promise.all(
          matter.authors.map((id) => {
            return getPersonById(id, locale)
          }),
        )
      : [],
    editors: Array.isArray(matter.editors)
      ? await Promise.all(
          matter.editors.map((id) => {
            return getPersonById(id, locale)
          }),
        )
      : [],
    contributors: Array.isArray(matter.contributors)
      ? await Promise.all(
          matter.contributors.map((id) => {
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
  }

  return metadata
}

/**
 * Extracts post frontmatter.
 */
async function getPostFrontmatter(
  file: VFile,
  _locale: Locale,
): Promise<PostFrontmatter> {
  extractFrontmatter(file)

  const { matter } = file.data as { matter: PostFrontmatter }

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
