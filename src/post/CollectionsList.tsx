import Link from 'next/link'

import type { CollectionPreview } from '@/api/cms/collection'
import { routes } from '@/navigation/routes.config'

export interface CollectionsListProps {
  collections: Array<CollectionPreview>
}

export function CollectionsList(props: CollectionsListProps): JSX.Element {
  return (
    <ul className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
      {props.collections.map((collection) => {
        return (
          <li key={collection.id}>
            <CollectionPreviewCard collection={collection} />
          </li>
        )
      })}
    </ul>
  )
}

interface CollectionPreviewCardProps {
  collection: CollectionsListProps['collections'][number]
}

function CollectionPreviewCard(props: CollectionPreviewCardProps) {
  const { collection } = props
  return (
    <article className="rounded-xl shadow-card-md p-10 space-y-4">
      <Link href={routes.collection(collection.id)}>
        <a className="transition hover:text-primary-600 focus:outline-none focus-visible:ring focus-visible:ring-primary-600 rounded">
          <h2 className="font-bold text-2xl">{collection.title}</h2>
        </a>
      </Link>
      <p className="leading-7 text-neutral-500">{collection.abstract}</p>
      <ol className="list-decimal pl-4 space-y-2">
        {collection.resources.map((resource) => {
          return (
            <li key={resource.id}>
              <Link href={routes.resource(resource.id)}>
                <a className="transition hover:text-primary-600 focus:outline-none focus-visible:ring focus-visible:ring-primary-600 rounded">
                  {resource.title}
                </a>
              </Link>
            </li>
          )
        })}
      </ol>
    </article>
  )
}
