import type { PreviewTemplateComponentProps } from 'netlify-cms-core'
import { useState, useEffect } from 'react'
import { compile } from 'xdm'

import type { Post as PostData, PostFrontmatter } from '@/api/cms/post'
import { Preview } from '@/cms/Preview'
import { useDebouncedState } from '@/common/useDebouncedState'
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
  const [post, setPost] = useState<PostData | null>(null)

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
                return fieldsMetaData.getIn(['authors', 'people', id]).toJS()
              })
              .filter(Boolean)
          : []
        const contributors = Array.isArray(frontmatter.contributors)
          ? frontmatter.contributors
              .map((id) => {
                return fieldsMetaData
                  .getIn(['contributors', 'people', id])
                  .toJS()
              })
              .filter(Boolean)
          : []
        const editors = Array.isArray(frontmatter.editors)
          ? frontmatter.editors
              .map((id) => {
                return fieldsMetaData.getIn(['editors', 'people', id]).toJS()
              })
              .filter(Boolean)
          : []

        const categories = Array.isArray(frontmatter.categories)
          ? frontmatter.categories
              .map((id) => {
                return fieldsMetaData
                  .getIn(['categories', 'categories', id])
                  .toJS()
              })
              .filter(Boolean)
          : []

        const tags = Array.isArray(frontmatter.tags)
          ? frontmatter.tags
              .map((id) => {
                return fieldsMetaData.getIn(['tags', 'tags', id]).toJS()
              })
              .filter(Boolean)
          : []

        const metadata = {
          ...frontmatter,
          authors,
          contributors,
          editors,
          categories,
          tags,
        }

        const code = String(
          await compile(body, {
            outputFormat: 'function-body',
            useDynamicImport: false,
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
      {post === null ? null : (
        <Post post={post} lastUpdatedAt={null} isPreview />
      )}
    </Preview>
  )
}
