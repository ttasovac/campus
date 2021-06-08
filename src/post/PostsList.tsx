import Link from 'next/link'
import type { FC, SVGProps } from 'react'

import { useFakeMasonry } from './useFakeMasonry'

import type { EventPreview } from '@/api/cms/event'
import type { PostPreview } from '@/api/cms/post'
import { Svg as AudioIcon } from '@/assets/icons/audio.svg'
import { Svg as DefaultAvatar } from '@/assets/icons/avatar.svg'
import { Svg as BookIcon } from '@/assets/icons/book.svg'
import { Svg as EventIcon } from '@/assets/icons/event.svg'
import { Svg as GlobeIcon } from '@/assets/icons/globe.svg'
import { Svg as PathfinderIcon } from '@/assets/icons/pathfinder.svg'
import { Svg as VideoIcon } from '@/assets/icons/video.svg'
import { Icon } from '@/common/Icon'
import { routes } from '@/navigation/routes.config'
import { getFullName } from '@/utils/getFullName'

const MAX_AUTHORS = 3

const contentTypeIcons: Record<
  PostPreview['type']['id'],
  FC<SVGProps<SVGSVGElement> & { title?: string }>
> = {
  audio: AudioIcon,
  event: EventIcon,
  pathfinder: PathfinderIcon,
  slides: BookIcon,
  'training-module': BookIcon,
  video: VideoIcon,
  'webinar-recording': BookIcon,
  website: GlobeIcon,
}

export interface PostsListProps {
  posts: Array<PostPreview | EventPreview>
}

/**
 * Lists one page of resources.
 */
export function PostsList(props: PostsListProps): JSX.Element {
  const { posts } = props

  const columns = useFakeMasonry(posts)

  if (columns != null) {
    return (
      <ul className="space-x-6 flex">
        {columns.map((posts, index) => {
          return (
            <div key={index} className="space-y-6 flex-1">
              {posts.map((post) => {
                return (
                  <li key={post.id}>
                    <PostPreviewCard post={post} />
                  </li>
                )
              })}
            </div>
          )
        })}
      </ul>
    )
  }

  return (
    <ul className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
      {posts.map((post) => {
        return (
          <li key={post.id}>
            <PostPreviewCard post={post} />
          </li>
        )
      })}
    </ul>
  )
}

interface PostPreviewCardProps {
  post: PostsListProps['posts'][number]
}

/**
 * Post preview.
 */
function PostPreviewCard(props: PostPreviewCardProps): JSX.Element {
  const { post } = props
  const authors = 'authors' in post ? post.authors : undefined

  const href = routes.resource(post.id)
  const icon = contentTypeIcons[post.type.id]

  return (
    <article className="flex flex-col overflow-hidden border rounded-xl hover:shadow-card-md shadow-card-sm border-neutral-150">
      <div className="flex flex-col px-10 py-10 space-y-5">
        <h2 className="text-2xl font-semibold">
          <Link href={href}>
            <a className="transition hover:text-primary-600">
              {icon !== undefined ? (
                <span className="inline-flex mr-2 text-primary-600">
                  <Icon icon={icon} className="w-5 h-5" />
                </span>
              ) : null}
              <span>{post.title}</span>
            </a>
          </Link>
        </h2>
        <div className="leading-7 text-neutral-500">{post.abstract}</div>
      </div>
      <footer className="flex items-center justify-between px-10 py-5 bg-neutral-100">
        <dl>
          {Array.isArray(authors) && authors.length > 0 ? (
            <div>
              <dt className="sr-only">Authors</dt>
              <dd>
                <ul className="flex items-center space-x-1">
                  {authors.slice(0, MAX_AUTHORS).map((author) => {
                    return (
                      <li key={author.id}>
                        <span className="sr-only">
                          {getFullName(author.firstName, author.lastName)}
                        </span>
                        {author.avatar !== undefined ? (
                          <img
                            src={author.avatar}
                            alt=""
                            loading="lazy"
                            className="w-8 h-8 rounded-full object-cover"
                          />
                        ) : (
                          <Icon
                            icon={DefaultAvatar}
                            className="w-8 h-8 rounded-full text-primary-600 object-cover"
                          />
                        )}
                      </li>
                    )
                  })}
                </ul>
              </dd>
            </div>
          ) : null}
        </dl>
        <Link href={href}>
          <a className="transition hover:text-primary-600">Read more &rarr;</a>
        </Link>
      </footer>
    </article>
  )
}
