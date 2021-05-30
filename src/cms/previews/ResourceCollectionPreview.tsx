import type { PreviewTemplateComponentProps } from 'netlify-cms-core'

import { Preview } from '@/cms/Preview'

/**
 * CMS preview for collection of resources.
 */
export function ResourceCollectionPreview(
  props: PreviewTemplateComponentProps,
): JSX.Element {
  return (
    <Preview {...props}>
      <p>Collection preview</p>
    </Preview>
  )
}
