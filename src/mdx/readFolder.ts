import { promises as fs } from 'fs'

import type { FolderPath } from '@/utils/ts/aliases'

/**
 * Reads folder contents and returns file names without extension.
 */
export async function readFolder(
  folderPath: FolderPath,
  fileExtension: string,
): Promise<Array<string>> {
  const fileNames = await fs.readdir(folderPath)
  const ids = fileNames.map((fileName) => {
    return fileName.slice(0, -fileExtension.length)
  })

  return ids
}