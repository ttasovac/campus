import type { SearchIndex } from 'algoliasearch/lite'
import algoliasearch from 'algoliasearch/lite'

import { apiKey, appId, indexName } from '~/config/algolia.config'

export function getSearchIndex(name = indexName): SearchIndex {
  if (appId === undefined) {
    throw new Error('No algolia app id provided.')
  }
  if (apiKey === undefined) {
    throw new Error('No algolia API key provided.')
  }
  if (name === undefined) {
    throw new Error('No algolia search index name provided.')
  }

  const searchClient = algoliasearch(appId, apiKey)

  return searchClient.initIndex(name)
}
