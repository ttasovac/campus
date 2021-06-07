import type { SearchIndex } from 'algoliasearch'
import algoliasearch from 'algoliasearch'

import { getPostPreviews } from '@/api/cms/post'
import { getFullName } from '@/utils/getFullName'
import { log } from '@/utils/log'
import {
  writeApiKey as apiKey,
  appId,
  indexName,
} from '~/config/algolia.config'

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

async function main() {
  try {
    const index = getSearchIndex()

    const locale = 'en'

    const posts = (await getPostPreviews(locale)).map((post) => {
      const { abstract, authors, date, id, tags, title } = post

      return {
        kind: 'resource',
        abstract,
        authors: authors.map((author) => {
          return {
            name: getFullName(author.firstName, author.lastName),
            id: author.id,
          }
        }),
        date,
        id,
        objectID: id,
        tags: tags.map((tag) => {
          return {
            name: tag.name,
            id: tag.id,
          }
        }),
        title,
      }
    })

    // TODO: index events and curricula

    index.saveObjects(posts)
  } catch (error) {
    log.warn(error.message)
  }
}

main()
