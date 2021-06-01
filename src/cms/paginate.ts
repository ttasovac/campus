import { range } from '@/utils/range'

const defaultPageSize = 10

export interface Page<T> {
  items: Array<T>
  page: number
  pages: number
}

/**
 * Creates pages of items.
 */
export function paginate<T>(
  items: Array<T>,
  pageSize = defaultPageSize,
): Array<Page<T>> {
  const pages = getPageRange(items, pageSize)

  return pages.map((page) => {
    return {
      items: items.slice((page - 1) * pageSize, pageSize),
      page,
      pages: pages.length,
    }
  })
}

/**
 * Returns page range, starting at 1.
 */
export function getPageRange(
  items: Array<unknown>,
  pageSize = defaultPageSize,
): Array<number> {
  return range(Math.ceil(items.length / pageSize), 1)
}
