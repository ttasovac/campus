import { getSearchIndex } from '@/api/algolia'
import { indexName } from '~/config/algolia.config'

async function main() {
  const index = getSearchIndex()
}

main()
