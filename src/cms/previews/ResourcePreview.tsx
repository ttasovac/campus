import withSyntaxHighlighting from '@stefanprobst/rehype-shiki'
import type { PreviewTemplateComponentProps } from 'netlify-cms-core'
import { useState, useEffect } from 'react'
import withHeadingIds from 'rehype-slug'
import withFootnotes from 'remark-footnotes'
import withGitHubMarkdown from 'remark-gfm'
import { compile } from 'xdm'

import type { Post as PostData, PostFrontmatter } from '@/api/cms/post'
import { Preview } from '@/cms/Preview'
import { useDebouncedState } from '@/common/useDebouncedState'
import withHeadingLinks from '@/mdx/plugins/rehype-heading-links'
import withImageCaptions from '@/mdx/plugins/rehype-image-captions'
import withLazyLoadingImages from '@/mdx/plugins/rehype-lazy-loading-images'
import withNoReferrerLinks from '@/mdx/plugins/rehype-no-referrer-links'
import { Post } from '@/post/Post'

/**
 * CMS preview for resource.
 *
 * TODO: Don't recompile mdx when only metadata changes.
 */
export function ResourcePreview(
  props: PreviewTemplateComponentProps,
): JSX.Element {
  const entry = useDebouncedState(props.entry, 250)
  const fieldsMetaData = useDebouncedState(props.fieldsMetaData, 250)
  const [post, setPost] = useState<PostData | null | undefined>(undefined)

  useEffect(() => {
    let wasCanceled = false

    async function compileMdx() {
      try {
        const { body, ...partialFrontmatter } = entry.get('data').toJS()
        const frontmatter = partialFrontmatter as Partial<PostFrontmatter>

        const id = entry.get('slug')

        const authors = Array.isArray(frontmatter.authors)
          ? frontmatter.authors
              .map((id) => {
                const metadata = fieldsMetaData
                  .getIn(['authors', 'people', id])
                  .toJS()
                return { id, ...metadata }
              })
              .filter(Boolean)
          : []
        const contributors = Array.isArray(frontmatter.contributors)
          ? frontmatter.contributors
              .map((id) => {
                const metadata = fieldsMetaData
                  .getIn(['contributors', 'people', id])
                  .toJS()
                return { id, ...metadata }
              })
              .filter(Boolean)
          : []
        const editors = Array.isArray(frontmatter.editors)
          ? frontmatter.editors
              .map((id) => {
                const metadata = fieldsMetaData
                  .getIn(['editors', 'people', id])
                  .toJS()
                return { id, ...metadata }
              })
              .filter(Boolean)
          : []

        const categories = Array.isArray(frontmatter.categories)
          ? frontmatter.categories
              .map((id) => {
                const metadata = fieldsMetaData
                  .getIn(['categories', 'categories', id])
                  .toJS()
                return { id, ...metadata }
              })
              .filter(Boolean)
          : []

        const tags = Array.isArray(frontmatter.tags)
          ? frontmatter.tags
              .map((id) => {
                const metadata = fieldsMetaData
                  .getIn(['tags', 'tags', id])
                  .toJS()
                return { id, ...metadata }
              })
              .filter(Boolean)
          : []

        const type = {
          id: frontmatter.type,
          ...fieldsMetaData
            .getIn(['type', 'content-types', frontmatter.type])
            .toJS(),
        }

        const metadata = {
          ...frontmatter,
          authors,
          contributors,
          editors,
          categories,
          tags,
          type,
        }

        const { getHighlighter, setCDN, BUNDLED_LANGUAGES } = await import(
          /* @ts-expect-error Typescript knows nothing about .mjs files. */
          'shiki/dist/index.browser.mjs'
        )
        setCDN('https://unpkg.com/shiki/')
        // const highlighter = await getHighlighter({
        //   theme: 'material-palenight',
        // })

        const code = String(
          await compile(body, {
            outputFormat: 'function-body',
            useDynamicImport: false,
            remarkPlugins: [withGitHubMarkdown, withFootnotes],
            rehypePlugins: [
              [withSyntaxHighlighting, { theme: 'material-palenight' }],
              withHeadingIds,
              // withExtractedTableOfContents,
              withHeadingLinks,
              withNoReferrerLinks,
              withLazyLoadingImages,
              withImageCaptions,
            ],
          }),
        )

        const post = {
          id,
          code,
          data: {
            metadata,
            toc: [],
          },
        } as PostData

        if (!wasCanceled) {
          setPost(post)
        }
      } catch {
        setPost(null)
      }

      return () => {
        wasCanceled = true
      }
    }

    compileMdx()
  }, [entry, fieldsMetaData])

  return (
    <Preview {...props}>
      {post == null ? (
        post === undefined ? null : (
          <div>
            <p>Failed to render preview.</p>
            <p>
              This usually indicates a syntax error in the Markdown content.
            </p>
          </div>
        )
      ) : (
        <Post post={post} lastUpdatedAt={null} isPreview />
      )}
    </Preview>
  )
}
