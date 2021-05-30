import { join } from 'path'

import * as YAML from 'js-yaml'
import type { VFile } from 'vfile'

import type { Locale } from '@/i18n/i18n.config'
import { readFile } from '@/mdx/readFile'
import { readFolder } from '@/mdx/readFolder'
import type { FilePath } from '@/utils/ts/aliases'

const categoryFolder = join(process.cwd(), 'content', 'categories')
const categoryExtension = '.yml'

export interface CategoryId {
  id: string
}

export interface CategoryData {
  name: string
  description: string
  host?: string
  image?: FilePath
}

export interface Category extends CategoryId, CategoryData {}

/**
 * Returns all category ids (slugs).
 */
export async function getCategoryIds(_locale: Locale): Promise<Array<string>> {
  const ids = await readFolder(categoryFolder, categoryExtension)

  return ids
}

/**
 * Returns category data.
 */
export async function getCategoryById(
  id: string,
  locale: Locale,
): Promise<Category> {
  const file = await getCategoryFile(id, locale)
  const data = await getCategoryData(file, locale)

  return { id, ...data }
}

/**
 * Returns data for all categorys, sorted by name.
 */
export async function getCategories(locale: Locale): Promise<Array<Category>> {
  const ids = await getCategoryIds(locale)

  const data = await Promise.all(
    ids.map(async (id) => {
      const file = await getCategoryFile(id, locale)
      const data = await getCategoryData(file, locale)

      return { id, ...data }
    }),
  )

  data.sort((a, b) => a.name.localeCompare(b.name, locale))

  return data
}

/**
 * Reads category file.
 */
async function getCategoryFile(id: string, locale: Locale): Promise<VFile> {
  const filePath = getCategoryFilePath(id, locale)
  const file = await readFile(filePath)

  return file
}

/**
 * Returns file path for category.
 */
export function getCategoryFilePath(id: string, _locale: Locale): FilePath {
  const filePath = join(categoryFolder, id + categoryExtension)

  return filePath
}

/**
 * Returns person data.
 */
async function getCategoryData(
  file: VFile,
  _locale: Locale,
): Promise<CategoryData> {
  const data = YAML.load(String(file), {
    schema: YAML.CORE_SCHEMA,
  }) as CategoryData

  return data
}
