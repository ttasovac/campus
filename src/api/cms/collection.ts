import { join } from 'path'

import type { Toc } from '@stefanprobst/rehype-extract-toc'
import withExtractedTableOfContents from '@stefanprobst/rehype-extract-toc'
import withSyntaxHighlighting from '@stefanprobst/rehype-shiki'
import withHeadingIds from 'rehype-slug'
import withFootnotes from 'remark-footnotes'
import withGitHubMarkdown from 'remark-gfm'
import type { VFile } from 'vfile'

import type { PostId, PostPreview } from '@/api/cms/post'
import { getPostPreviewById } from '@/api/cms/post'
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

const collectionFolder = join(process.cwd(), 'content', 'curricula')
const collectionExtension = '.mdx'

export interface CollectionId {
  /** Slug. */
  id: string
}

type ID = CollectionId['id']

export interface CollectionFrontmatter {
  uuid: string
  title: string
  shortTitle?: string
  date: ISODateString
  resources: Array<PostId['id']>
  abstract: string
  // TODO: do we need TOC? (in case curricula descriptions are long?)
}

export interface CollectionMetadata
  extends Omit<CollectionFrontmatter, 'resources'> {
  resources: Array<PostPreview>
}

export interface CollectionData {
  /** Metadata. */
  metadata: CollectionMetadata
  /** Table of contents. */
  toc: Toc
}

export interface Collection extends CollectionId {
  /** Metadata and table of contents. */
  data: CollectionData
  /** Mdx compiled to function body. Must be hydrated on the client with `useMdx`. */
  code: string
}

export interface CollectionPreview extends CollectionId, CollectionMetadata {}

/**
 * Returns all collection ids (slugs).
 */
export async function getCollectionIds(
  _locale: Locale,
): Promise<Array<string>> {
  const ids = await readFolder(collectionFolder, collectionExtension)

  return ids
}

/**
 * Returns collection content, table of contents, and metadata.
 */
export async function getCollectionById(
  id: ID,
  locale: Locale,
): Promise<Collection> {
  const file = await getCollectionFile(id, locale)
  const metadata = await getCollectionMetadata(file, locale)
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
 * Returns all collections, sorted by date.
 */
export async function getCollections(
  locale: Locale,
): Promise<Array<Collection>> {
  const ids = await getCollectionIds(locale)

  const collections = await Promise.all(
    ids.map(async (id) => {
      return getCollectionById(id, locale)
    }),
  )

  collections.sort((a, b) =>
    a.data.metadata.date === b.data.metadata.date
      ? 0
      : a.data.metadata.date > b.data.metadata.date
      ? -1
      : 1,
  )

  return collections
}

/**
 * Returns collection metadata.
 */
export async function getCollectionPreviewById(
  id: ID,
  locale: Locale,
): Promise<CollectionPreview> {
  const file = await getCollectionFile(id, locale)
  const metadata = await getCollectionMetadata(file, locale)

  return { id, ...metadata }
}

/**
 * Returns metadata for all collections, sorted by date.
 */
export async function getCollectionPreviews(
  locale: Locale,
): Promise<Array<CollectionPreview>> {
  const ids = await getCollectionIds(locale)

  const metadata = await Promise.all(
    ids.map(async (id) => {
      return getCollectionPreviewById(id, locale)
    }),
  )

  metadata.sort((a, b) => (a.date === b.date ? 0 : a.date > b.date ? -1 : 1))

  return metadata
}

/**
 * Reads collection file.
 */
async function getCollectionFile(id: ID, locale: Locale): Promise<VFile> {
  const filePath = getCollectionFilePath(id, locale)
  const file = await readFile(filePath)

  return file
}

/**
 * Returns file path for collection.
 */
export function getCollectionFilePath(id: ID, _locale: Locale): FilePath {
  const filePath = join(collectionFolder, id + collectionExtension)

  return filePath
}

/**
 * Extracts collection metadata and resolves foreign-key relations.
 */
async function getCollectionMetadata(
  file: VFile,
  locale: Locale,
): Promise<CollectionMetadata> {
  const matter = await getCollectionFrontmatter(file, locale)

  const metadata = {
    ...matter,
    resources: Array.isArray(matter.resources)
      ? await Promise.all(
          matter.resources.map((id) => {
            return getPostPreviewById(id, locale)
          }),
        )
      : [],
  }

  return metadata
}

/**
 * Extracts collection frontmatter.
 */
async function getCollectionFrontmatter(
  file: VFile,
  _locale: Locale,
): Promise<CollectionFrontmatter> {
  extractFrontmatter(file)

  const { matter } = file.data as { matter: CollectionFrontmatter }

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
