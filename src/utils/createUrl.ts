import { addQueryParams } from '@/utils/addQueryParams'

/**
 * Creates URL from path, optional base URL, and optional query parameters.
 */
export function createUrl({
  baseUrl = 'https://n',
  locale,
  path,
  query,
}: {
  baseUrl?: string
  locale?: string
  path: string
  query?: Record<string, unknown>
}): URL {
  const pathname =
    locale !== undefined
      ? [locale, path].join(path.startsWith('/') ? '' : '/')
      : path

  const url = new URL(pathname, baseUrl)

  if (query !== undefined) {
    addQueryParams(url, query)
  }

  return url
}
