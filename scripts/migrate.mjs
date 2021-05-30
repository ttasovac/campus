#!/usr/bin/env node

/**
 * 1. Move mdx files to mdx v2, move image folder
 *   - no indented code blocks, always use fenced code blocks
 *   - no autolinks, always use reference links
 *
 * 2. Split data (persons, tags, categories) into separate files.
 *
 * 3. change slug order for persons from firstName-lastName to lastName-firstName.
 *
 * 4. Generate UUIDs for all resources.
 *
 * 5. Generate redirects for resources (slug=>UUID) and authors (firstName-lastName=>lastName-firstName)
 *
 * 6. Update docs
 */

import * as fs from 'fs'
import * as YAML from 'js-yaml'
import { CORE_SCHEMA } from 'js-yaml'
import { nanoid } from 'nanoid'
import { basename, join, relative } from 'path'
import remark from 'remark'
import withFootnotes from 'remark-footnotes'
import withFrontmatter from 'remark-frontmatter'
import withGitHubMarkdown from 'remark-gfm'
import visit from 'unist-util-visit'
import vfile from 'vfile'
import { remarkMarkAndUnravel as withUnraveledJsxChildren } from 'xdm/lib/plugin/remark-mark-and-unravel.js'
import { remarkMdx as withMdx } from 'xdm/lib/plugin/remark-mdx.js'

const publicFolder = join(process.cwd(), 'public')
const contentsFolder = join(process.cwd(), 'contents')
const dataFolder = join(contentsFolder, 'data')

const personIds = new Map()
const postIds = new Map()

/**
 * Migrate post frontmatter and image paths.
 */
function migratePosts() {
  function withMigratedMetadata() {
    return transformer

    function transformer(tree, file) {
      visit(tree, 'yaml', onYaml)

      function onYaml(node) {
        const frontmatter = YAML.load(String(node.value), {
          schema: YAML.CORE_SCHEMA,
        })

        /**
         * Ensure UUID.
         */
        if (frontmatter.uuid == null) {
          frontmatter.uuid = nanoid()
        }
        file.data.uuid = frontmatter.uuid
        if (frontmatter.pid != null) {
          delete frontmatter.pid
        }

        /**
         * Update person slugs.
         */
        if (Array.isArray(frontmatter.authors)) {
          frontmatter.authors = frontmatter.authors.map((author) => {
            return personIds.get(author)
          })
        }
        if (Array.isArray(frontmatter.editors)) {
          frontmatter.editors = frontmatter.editors.map((author) => {
            return personIds.get(author)
          })
        }
        if (Array.isArray(frontmatter.contributors)) {
          frontmatter.contributors = frontmatter.contributors.map((author) => {
            return personIds.get(author)
          })
        }

        /**
         * Update remote hosting info.
         */
        frontmatter.remote = {}
        if (frontmatter.remoteUrl != null) {
          frontmatter.remote.url = frontmatter.remoteUrl
          delete frontmatter.remoteUrl
        }
        if (frontmatter.remotePublisher != null) {
          frontmatter.remote.publisher = frontmatter.remotePublisher
          delete frontmatter.remotePublisher
        }
        frontmatter.remote.date = frontmatter.remotePublicationDate ?? ''
        delete frontmatter.remotePublicationDate

        /**
         * Update featured image path.
         */
        if (frontmatter.featuredImage != null) {
          frontmatter.featuredImage = join(
            assetsFolder,
            file.data.folderName,
            basename(frontmatter.featuredImage),
          )
        }

        /**
         * Update resource type slug.
         */
        if (frontmatter.type != null) {
          frontmatter.type = frontmatter.type.replace(' ', '-')
        }

        /**
         * Update licence slug.
         */
        if (frontmatter.licence != null) {
          frontmatter.licence = frontmatter.licence
            .replace(' ', '-')
            .toLowerCase()
        }

        node.value = YAML.dump(frontmatter, {
          schema: YAML.CORE_SCHEMA,
          quotingType: '"',
        }).trim()
      }
    }
  }

  function withMigratedImagePaths() {
    return transformer

    function transformer(tree, file) {
      visit(tree, 'image', onImage)

      function onImage(node) {
        const url = node.url
        if (typeof url === 'string' && url.startsWith('images/')) {
          node.url = relative(
            publicFolder,
            join(assetsFolder, file.data.folderName, basename(url)),
          )
        }
      }
    }
  }

  function withMigratedVideCardImagePaths() {
    return transformer

    function transformer(tree, file) {
      visit(tree, 'mdxJsxFlowElement', visitor)

      function visitor(node) {
        if (node.name === 'VideoCard') {
          node.attributes = node.attributes.map((attribute) => {
            if (attribute.name === 'image' && attribute.value != null) {
              attribute.value = relative(
                publicFolder,
                join(
                  assetsFolder,
                  file.data.folderName,
                  basename(attribute.value),
                ),
              )
            }
            return attribute
          })
        }
      }
    }
  }

  const processor = remark()
    .use({
      settings: {
        bullet: '-',
        emphasis: '_',
        fences: true,
        incrementListMarker: true,
        listItemIndent: 'one',
        resourceLink: true,
        rule: '-',
        strong: '*',
      },
    })
    .use(withMdx)
    .use(withUnraveledJsxChildren)
    .use(withFrontmatter)
    .use(withGitHubMarkdown)
    .use(withFootnotes)
    .use(withMigratedMetadata)
    .use(withMigratedImagePaths)
    .use(withMigratedVideCardImagePaths)

  const assetsFolder = join(publicFolder, 'assets', 'images', 'cms', 'posts')
  if (!fs.existsSync(assetsFolder)) {
    fs.mkdirSync(assetsFolder, { recursive: true })
  }

  const postsFolder = join(contentsFolder, 'resources')
  const postFolderNames = fs.readdirSync(postsFolder)

  postFolderNames.forEach((folderName) => {
    const filePath = join(postsFolder, folderName, 'index.mdx')
    const file = vfile({
      contents: fs.readFileSync(filePath, { encoding: 'utf-8' }),
      path: filePath,
    })
    file.data.folderName = folderName

    /**
     * Fix markdown (autolinks, fenced codeblocks, add UUIDs, change person slugs, image paths).
     */
    const processedFile = processor.processSync(file)
    const uuid = processedFile.data.uuid
    postIds.set(folderName, uuid)

    fs.writeFileSync(
      join(postsFolder, folderName + '.mdx'),
      String(processedFile),
      { encoding: 'utf-8' },
    )

    /**
     * Move images.
     */
    const imageFolder = join(postsFolder, folderName, 'images')
    if (fs.existsSync(imageFolder)) {
      fs.renameSync(imageFolder, join(assetsFolder, folderName))
    }
  })

  /**
   * Write out redirects.
   */
  fs.writeFileSync(
    join(process.cwd(), 'redirects.posts.json'),
    JSON.stringify(Object.fromEntries(postIds)),
    { encoding: 'utf-8' },
  )
}

/**
 * Migrate person metadata and image paths.
 */
function migratePersons() {
  const personsFile = join(dataFolder, 'person.yaml')

  const contents = fs.readFileSync(personsFile, { encoding: 'utf-8' })
  const persons = YAML.load(contents, { schema: YAML.CORE_SCHEMA })

  const personsFolder = join(contentsFolder, 'persons')
  if (!fs.existsSync(personsFolder)) {
    fs.mkdirSync(personsFolder, { recursive: true })
  }

  const assetsFolder = join(publicFolder, 'assets', 'images', 'cms', 'persons')
  if (!fs.existsSync(assetsFolder)) {
    fs.mkdirSync(assetsFolder, { recursive: true })
  }

  persons.forEach((person) => {
    /**
     * Change slug from firstName-lastName to lastName-firsName.
     */
    const fragments = person.name.split(' ').reverse()
    const slug = fragments.join('-').toLowerCase()
    /** Map old to new slug, so we can use it in posts frontmatter. */
    personIds.set(person.slug, slug)
    delete person.slug

    /**
     * Names with special characters (like diacritics), or names with more than 2 parts should be manually checked.
     */
    if (/[^A-Za-z -]/.test(person.name)) {
      console.warn(`[NEEDS REVIEW] ${person.name} includes special characters.`)
    }
    if (fragments.length > 2) {
      console.warn(
        `[NEEDS REVIEW] ${person.name} has either more than one first name or last name`,
      )
    }

    /**
     * Remove name field, and add lastName and firstName fields.
     */
    const [lastName, ...firstNames] = fragments
    person.firstName = firstNames.join(' ')
    person.lastName = lastName
    delete person.name

    /**
     * Update avatar path.
     */
    if (person.avatar != null) {
      person.avatar = relative(
        publicFolder,
        join(assetsFolder, basename(person.avatar)),
      )
    }

    /**
     * Write persons into individual files.
     */
    const filePath = join(personsFolder, slug + '.yml')
    fs.writeFileSync(filePath, YAML.dump(person, { schema: CORE_SCHEMA }), {
      encoding: 'utf-8',
    })
  })

  /**
   * Move images.
   */
  fs.renameSync(join(contentsFolder, 'images', 'authors'), assetsFolder)

  /**
   * Write out redirects.
   */
  fs.writeFileSync(
    join(process.cwd(), 'redirects.persons.json'),
    JSON.stringify(Object.fromEntries(personIds)),
    { encoding: 'utf-8' },
  )
}

/**
 * Migrate tags.
 */
function migrateTags() {
  const tagsFile = join(dataFolder, 'tag.yaml')

  const contents = fs.readFileSync(tagsFile, { encoding: 'utf-8' })
  const tags = YAML.load(contents, { schema: YAML.CORE_SCHEMA })

  const tagsFolder = join(contentsFolder, 'tags')
  if (!fs.existsSync(tagsFolder)) {
    fs.mkdirSync(tagsFolder, { recursive: true })
  }

  tags.forEach((tag) => {
    const slug = tag.slug

    /**
     * Write tags into individual files.
     */
    const filePath = join(tagsFolder, slug + '.yml')
    fs.writeFileSync(filePath, YAML.dump(tag, { schema: CORE_SCHEMA }), {
      encoding: 'utf-8',
    })
  })
}

/**
 * Migrate categories.
 */
function migrateCategories() {
  const categoriesFile = join(dataFolder, 'category.yaml')

  const contents = fs.readFileSync(categoriesFile, { encoding: 'utf-8' })
  const categories = YAML.load(contents, { schema: YAML.CORE_SCHEMA })

  const categoriesFolder = join(contentsFolder, 'categories')
  if (!fs.existsSync(categoriesFolder)) {
    fs.mkdirSync(categoriesFolder, { recursive: true })
  }

  const assetsFolder = join(
    publicFolder,
    'assets',
    'images',
    'cms',
    'categories',
  )
  if (!fs.existsSync(assetsFolder)) {
    fs.mkdirSync(assetsFolder, { recursive: true })
  }

  categories.forEach((category) => {
    const slug = category.slug

    /**
     * Update image path.
     */
    if (category.image != null) {
      category.image = relative(
        publicFolder,
        join(assetsFolder, basename(category.image)),
      )
    }

    /**
     * Write categories into individual files.
     */
    const filePath = join(categoriesFolder, slug + '.yml')
    fs.writeFileSync(filePath, YAML.dump(category, { schema: CORE_SCHEMA }), {
      encoding: 'utf-8',
    })
  })

  /**
   * Move images.
   */
  fs.renameSync(join(contentsFolder, 'images', 'categories'), assetsFolder)
}

function main() {
  migratePersons()
  migratePosts()
  migrateTags()
  migrateCategories()
}

main()
