import type { PreviewTemplateComponentProps } from 'netlify-cms-core'
import { Preview } from '@/cms/Preview'

/**
 * CMS preview for resource.
 */
export function ResourcePreview(
  props: PreviewTemplateComponentProps,
): JSX.Element {
  return (
    <Preview {...props}>
      <p>Resource preview</p>
    </Preview>
  )
}
