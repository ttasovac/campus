import Link from 'next/link'

import type { Collection as CollectionData } from '@/api/cms/collection'
import { Svg as PencilIcon } from '@/assets/icons/pencil.svg'
import { Icon } from '@/common/Icon'
import { useI18n } from '@/i18n/useI18n'
import { Mdx as CollectionContent } from '@/mdx/Mdx'
import { routes } from '@/navigation/routes.config'
import { EditLink } from '@/post/EditLink'
import type { ISODateString } from '@/utils/ts/aliases'

export interface CollectionProps {
  collection: CollectionData
  lastUpdatedAt: ISODateString | null
  isPreview?: boolean
}

/**
 * Resource collection (curriculum).
 */
export function Collection(props: CollectionProps): JSX.Element {
  const { collection, lastUpdatedAt, isPreview } = props
  const { metadata } = collection.data
  const { title, date, resources } = metadata

  const { formatDate } = useI18n()

  return (
    <article className="space-y-16 max-w-80ch w-full mx-auto">
      <header className="space-y-10">
        <h1 className="font-bold text-4.5xl text-center">{title}</h1>
        <dl className="grid grid-cols-2 text-sm text-neutral-500">
          <div className="space-y-1">
            {date != null ? (
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
          </div>
        </dl>
      </header>
      <div className="prose max-w-none">
        <CollectionContent {...collection} />
      </div>
      <nav aria-label="Resources" className="space-y-4">
        <h2 className="text-2xl font-bold">Resources</h2>
        <ol className="list-decimal pl-4 space-y-2">
          {resources.map((resource) => {
            return (
              <li key={resource.id}>
                <Link href={routes.resource(resource.id)}>
                  <a className="transition hover:text-primary-600 focus:outline-none focus-visible:ring focus-visible:ring-primary-600">
                    {resource.title}
                  </a>
                </Link>
              </li>
            )
          })}
        </ol>
      </nav>
      <footer>
        {lastUpdatedAt != null ? (
          <p className="text-right text-sm text-neutral-500">
            <span>Last updated: </span>
            <time dateTime={lastUpdatedAt}>
              {formatDate(new Date(lastUpdatedAt), undefined, {
                dateStyle: 'medium',
              })}
            </time>
          </p>
        ) : null}
        {isPreview !== true ? (
          /**
           * We cannot link to CMS via client-side transition, because Netlify CMS
           * unfortunately sets global styles, which would bleed into the app when navigating
           * back via browser back button.
           */
          <EditLink
            collection="resourceCollections"
            id={collection.id}
            className="text-sm flex justify-end items-center space-x-1.5 text-neutral-500"
          >
            <Icon icon={PencilIcon} className="w-4 h-4" />
            <span className="text-right">Suggest changes to curriculum</span>
          </EditLink>
        ) : null}
      </footer>
    </article>
  )
}
