import type { CmsConfig } from 'netlify-cms-core'

/**
 * Netlify CMS config.
 *
 * @see https://www.netlifycms.org/docs/configuration-options/
 * @see https://www.netlifycms.org/docs/beta-features/
 */
export const config: CmsConfig = {
  load_config_file: false,
  local_backend: process.env.NODE_ENV !== 'production',
  backend: {
    name: 'github',
    repo: 'stefanprobst/campus',
    auth_scope: 'repo', // 'public_repo'
    open_authoring: true,
    squash_merges: true,
    commit_messages: {
      create: 'content(cms): create {{collection}} "{{slug}}"',
      update: 'content(cms): update {{collection}} "{{slug}}"',
      delete: 'content(cms): delete {{collection}} "{{slug}}"',
      uploadMedia: 'content(cms): upload "{{path}}"',
      deleteMedia: 'content(cms): delete "{{path}}"',
      openAuthoring: '{{message}}',
    },
  },
  publish_mode: 'editorial_workflow',
  media_folder: 'public/assets/images/cms',
  public_folder: '/assets/images/cms',
  editor: { preview: false },
  collections: [
    {
      name: 'resources',
      label: 'Resources',
      label_singular: 'Resource',
      folder: 'content/resources',
      format: 'frontmatter',
      extension: '.mdx',
      create: true,
      delete: false,
      media_folder: '{{media_folder}}/resources/{{slug}}',
      public_folder: '{{media_folder}}/resources/{{slug}}',
      summary: '{{title}} - {{date}}',
      fields: [
        {
          name: 'title',
          label: 'Title',
        },
        {
          name: 'date',
          label: 'Date',
          widget: 'datetime',
          time_format: 'false',
        },
        {
          name: 'body',
          label: 'Content',
          widget: 'markdown',
        },
      ],
    },
  ],
}
