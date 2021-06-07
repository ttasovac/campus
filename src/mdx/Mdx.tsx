import { components } from '@/mdx/components'
import { useMdx } from '@/mdx/useMdx'

export interface MdxProps {
  code: string
}

/**
 * Renders pre-compiled mdx content.
 *
 * TODO: reconsider making all components available everywhere (e.g. docs don't need Quiz).
 */
export function Mdx(props: MdxProps): JSX.Element {
  const { MdxContent, metadata } = useMdx(props.code)

  return <MdxContent {...metadata} components={components} />
}
