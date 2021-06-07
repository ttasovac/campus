import type { SearchIndex, SearchClient } from 'algoliasearch/lite'
import algoliasearch from 'algoliasearch/lite'

import { apiKey, appId, indexName } from '~/config/algolia.config'

export function getSearchClient(): SearchClient {
  if (appId === undefined) {
    throw new Error('No algolia app id provided.')
  }
  if (apiKey === undefined) {
    throw new Error('No algolia API key provided.')
  }

  return algoliasearch(appId, apiKey)
}

export function getSearchIndex(name = indexName): SearchIndex {
  if (name === undefined) {
    throw new Error('No algolia search index name provided.')
  }

  const searchClient = getSearchClient()

  return searchClient.initIndex(name)
}
