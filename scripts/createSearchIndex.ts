import type { SearchIndex } from 'algoliasearch'
import algoliasearch from 'algoliasearch'

import { getPostPreviews } from '@/api/cms/post'
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

async function main() {
  const index = getSearchIndex()

  const locale = 'en'

  const posts = (await getPostPreviews(locale)).map((post) => {
    const { abstract, authors, date, id, tags, title } = post

    return {
      abstract,
      authors: authors.map((author) => {
        return {
          name: [author.firstName, author.lastName].filter(Boolean).join(' '),
        }
      }),
      date,
      id,
      objectID: id,
      tags: tags.map((tag) => {
        return {
          name: tag.name,
        }
      }),
      title,
    }
  })

  index.saveObjects(posts)
}

main()
