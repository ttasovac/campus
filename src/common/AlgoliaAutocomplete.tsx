import { autocomplete, getAlgoliaResults } from '@algolia/autocomplete-js'
import type { AutocompleteComponents } from '@algolia/autocomplete-js'
import { useRouter } from 'next/router'
import React, { createElement, Fragment, useEffect, useRef } from 'react'
// @ts-expect-error Needs types package.
import { render } from 'react-dom'

import { getSearchClient } from '@/api/algolia'
import type { PostPreview } from '@/api/cms/post'
import { routes } from '@/navigation/routes.config'
import { getFullName } from '@/utils/getFullName'
import { indexName } from '~/config/algolia.config'
import { url as siteUrl } from '~/config/site.config'

export interface AlgoliaAutocompleteProps {
  openOnFocus?: boolean
}

/**
 * Renders algolia autocomplete.
 *
 * Note that this takes over the container as a new React root.
 * TODO: This currently does not correctly trap focus.
 * TODO: Might be better to drop this, and just use the `algoliasearch` client sdk directly.
 *
 * Styles come from `@algolia/autocomplete-theme-classic` and `@/styles/algolia.css`.
 */
export function AlgoliaAutocomplete(
  props: AlgoliaAutocompleteProps,
): JSX.Element {
  const containerRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  useEffect(() => {
    if (containerRef.current === null) return

    if (indexName === undefined) return

    const searchClient = getSearchClient()

    const search = autocomplete<PostPreview & { [key: string]: unknown }>({
      container: containerRef.current,
      renderer: { createElement, Fragment },
      render({ children }, root) {
        render(children, root)
      },
      getSources({ query }) {
        return [
          {
            sourceId: 'products',
            getItems() {
              return getAlgoliaResults({
                searchClient,
                queries: [
                  {
                    indexName: indexName!,
                    query,
                  },
                ],
              })
            },
            templates: {
              item({ item, components }) {
                // return <ProductItem hit={item} components={components} />
                return <Match hit={item} components={components} />
              },
            },
            getItemUrl({ item }) {
              return String(new URL(routes.resource(item.id).pathname, siteUrl))
            },
          },
        ]
      },
      navigator: {
        navigate({ itemUrl }) {
          router.push(itemUrl)
        },
      },
      /** Always show in detached mode (modal or fullscreen). */
      detachedMediaQuery: '',
      ...props,
    })

    return () => {
      search.destroy()
    }
  }, [props, router])

  return <div ref={containerRef} />
}

interface MatchProps {
  hit: PostPreview
  components: AutocompleteComponents
}

function Match(props: MatchProps) {
  const { hit } = props

  return (
    <dl className="flex flex-col space-y-1.5 my-1.5">
      <div>
        <dt className="sr-only">Title</dt>
        <dd className="font-medium">{hit.title}</dd>
      </div>
      <div>
        <dt className="sr-only">Authors</dt>
        <dd>
          {hit.authors
            .map(
              (author) =>
                // FIXME: author.name exists in legacy algolia index.
                // @ts-expect-error Needs updated algolia index.
                author.name ?? getFullName(author.firstName, author.lastName),
            )
            .join(', ')}
        </dd>
      </div>
      <div>
        <dt className="sr-only">Tags</dt>
        <dd>
          {hit.tags.map((tag) => (
            <span
              key={tag.id}
              className="bg-primary-600 rounded text-xs px-2 mr-1 text-white py-0.5"
            >
              {tag.name}
            </span>
          ))}
        </dd>
      </div>
    </dl>
  )
}
