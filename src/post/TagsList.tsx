import Link from 'next/link'

import type { Tag } from '@/api/cms/tag'
import { routes } from '@/navigation/routes.config'

export interface TagsListProps {
  tags: Array<Tag & { posts: number }>
}

/**
 * Tags list.
 */
export function TagsList(props: TagsListProps): JSX.Element {
  const { tags } = props

  return (
    <ul className="flex flex-wrap justify-center px-4 py-6 text-sm">
      {tags.map((tag) => {
        return (
          <li key={tag.id}>
            <Link href={routes.tag(tag.id)}>
              <a className="flex transition hover:bg-primary-700 focus-visible:bg-primary-700 px-3 py-1.5 mr-1 mb-1 text-center text-white rounded-full bg-primary-600 space-x-1">
                <span>{tag.name}</span>
                <span className="-mt-px text-xs">
                  {tag.posts}
                  <span className="sr-only">Resources</span>
                </span>
              </a>
            </Link>
          </li>
        )
      })}
    </ul>
  )
}
