import Link from 'next/link'

import type { Post as PostData } from '@/api/cms/post'
import { Svg as AvatarIcon } from '@/assets/icons/avatar.svg'
import { Svg as PencilIcon } from '@/assets/icons/pencil.svg'
import { Icon } from '@/common/Icon'
import { useI18n } from '@/i18n/useI18n'
import { Mdx as PostContent } from '@/mdx/Mdx'
import { routes } from '@/navigation/routes.config'
import { EditLink } from '@/post/EditLink'
import { getFullName } from '@/utils/getFullName'
import type { ISODateString } from '@/utils/ts/aliases'

export interface PostProps {
  post: PostData
  lastUpdatedAt: ISODateString | null
  isPreview?: boolean
}

export function Post(props: PostProps): JSX.Element {
  const { post, lastUpdatedAt, isPreview } = props
  const { metadata } = post.data
  const { title, date, authors, tags = [], categories: sources = [] } = metadata

  const { formatDate } = useI18n()

  return (
    <article className="w-full mx-auto space-y-16 max-w-80ch">
      <header className="space-y-10">
        <h1 className="font-bold text-4.5xl text-center">{title}</h1>
        <dl className="grid grid-cols-2 text-sm text-neutral-500">
          <div className="space-y-1">
            {authors.length > 0 ? (
              <div>
                <dt className="sr-only">Authors</dt>
                <dd>
                  <ul className="space-y-2">
                    {authors.map((author) => {
                      return (
                        <li key={author.id}>
                          <div className="flex items-center space-x-2">
                            {author.avatar !== undefined ? (
                              <img
                                src={author.avatar}
                                alt=""
                                loading="lazy"
                                className="w-8 h-8 rounded-full object-cover"
                              />
                            ) : (
                              <Icon
                                icon={AvatarIcon}
                                className="w-8 h-8 rounded-full text-primary-600 object-cover"
                              />
                            )}
                            <Link href={routes.author(author.id)}>
                              <a className="transition hover:text-primary-600 focus:outline-none focus-visible:ring focus-visible:ring-primary-600">
                                <span>
                                  {getFullName(
                                    author.firstName,
                                    author.lastName,
                                  )}
                                </span>
                              </a>
                            </Link>
                          </div>
                        </li>
                      )
                    })}
                  </ul>
                </dd>
              </div>
            ) : null}
          </div>
          <div className="space-y-1 text-right">
            {date != null &&
            (typeof date === 'string'
              ? date.length > 0
              : /* @ts-expect-error CMS preview template provides `Date`. */
                date instanceof Date) ? (
              <div>
                <dt className="sr-only">Publish date</dt>
                <dd>
                  <time dateTime={date}>
                    {formatDate(new Date(date), undefined, {
                      dateStyle: 'medium',
                    })}
                  </time>
                </dd>
              </div>
            ) : null}
            {sources.length > 0 ? (
              <div className="space-x-2">
                <dt className="inline">Sources:</dt>
                <dd className="inline">
                  <ul className="inline">
                    {sources.map((source, index) => {
                      return (
                        <li key={source.id} className="inline">
                          <Link href={routes.source(source.id)}>
                            <a className="transition hover:text-primary-600 focus:outline-none focus-visible:ring focus-visible:ring-primary-600">
                              <span>{source.name}</span>
                            </a>
                          </Link>
                          {index !== sources.length - 1 ? ', ' : null}
                        </li>
                      )
                    })}
                  </ul>
                </dd>
              </div>
            ) : null}
            {tags.length > 0 ? (
              <div className="space-x-2">
                <dt className="inline">Tags:</dt>
                <dd className="inline">
                  <ul className="inline">
                    {tags.map((tag, index) => {
                      return (
                        <li key={tag.id} className="inline">
                          <Link href={routes.tag(tag.id)}>
                            <a className="transition hover:text-primary-600 focus:outline-none focus-visible:ring focus-visible:ring-primary-600">
                              <span
                                className={index !== 0 ? 'ml-1' : undefined}
                              >
                                {tag.name}
                              </span>
                            </a>
                          </Link>
                          {index !== tags.length - 1 ? ', ' : null}
                        </li>
                      )
                    })}
                  </ul>
                </dd>
              </div>
            ) : null}
          </div>
        </dl>
      </header>
      <div className="prose max-w-none">
        <PostContent {...post} />
      </div>
      <footer>
        {lastUpdatedAt != null ? (
          <p className="text-sm text-right text-neutral-500">
            <span>Last updated: </span>
            <time dateTime={lastUpdatedAt}>
              {formatDate(new Date(lastUpdatedAt), undefined, {
                dateStyle: 'medium',
              })}
            </time>
          </p>
        ) : null}
        {isPreview !== true ? (
          <EditLink
            collection="resources"
            id={post.id}
            className="text-sm flex justify-end items-center space-x-1.5 text-neutral-500"
          >
            <Icon icon={PencilIcon} className="w-4 h-4" />
            <span className="text-right">Suggest changes to resource</span>
          </EditLink>
        ) : null}
      </footer>
    </article>
  )
}
