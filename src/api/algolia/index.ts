import type { SearchIndex } from 'algoliasearch/lite'
import algoliasearch from 'algoliasearch/lite'

import { apiKey, appId, indexName } from '~/config/algolia.config'

export const searchClient = algoliasearch(appId, apiKey)

export function getSearchIndex(name = indexName): SearchIndex {
  return searchClient.initIndex(name)
}
