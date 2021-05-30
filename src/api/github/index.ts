import { relative } from 'path'

import type { FilePath, ISODateString } from '@/utils/ts/aliases'

/**
 * Returns last updated git commit date for specified file path.
 */
export async function getLastUpdatedTimestamp(
  absoluteFilePath: FilePath,
): Promise<ISODateString | null> {
  const filePath = relative(process.cwd(), absoluteFilePath)

  const url = String(createCommitUrl(filePath))
  const response = await fetch(url, {
    headers: {
      Accept: 'application/vnd.github.v3+json',
    },
  })

  if (!response.ok) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error(
        `[${response.status}] Failed to fetch last updated timestamp for ${filePath}.`,
      )
    }
    return null
  }

  const data = await response.json()

  if (!Array.isArray(data) || data.length === 0) {
    return null
  }

  const [{ commit }] = data

  const timestamp = commit.committer.date

  return timestamp
}

/**
 * Creates GitHub API url to get last commit for file.
 */
function createCommitUrl(filePath: string) {
  const url = new URL(
    `/repos/stefanprobst/howto/commits`,
    'https://api.github.com',
  )
  url.searchParams.set('path', filePath)
  url.searchParams.set('per_page', String(1))

  return url
}
