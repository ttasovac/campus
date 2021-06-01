import Link from 'next/link'

import type { PostPreview } from '@/api/cms/post'
import type { Page } from '@/cms/paginate'
import { routes } from '@/navigation/routes.config'

export interface PostsListNavProps {
  posts: Page<PostPreview>
}

/**
 * Links to previous and next page of resources.
 */
export function PostsListNav(props: PostsListNavProps): JSX.Element {
  const { posts } = props

  const hasPrevPage = posts.page > 1
  const hasNextPage = posts.page < posts.pages

  return (
    <nav aria-label="Resource pages">
      <div>
        {hasPrevPage ? (
          <Link href={routes.resources(posts.page - 1)}>
            <a
              className="p-2 transition rounded hover:bg-primary-600 focus:outline-none focus-visible:ring focus-visible:ring-primary-600"
              rel="prev"
            >
              Previous Page
            </a>
          </Link>
        ) : null}
      </div>
      <div>
        {hasNextPage ? (
          <Link href={routes.resources(posts.page + 1)}>
            <a
              className="p-2 transition rounded hover:bg-primary-600 focus:outline-none focus-visible:ring focus-visible:ring-primary-600"
              rel="next"
            >
              Next Page
            </a>
          </Link>
        ) : null}
      </div>
    </nav>
  )
}
