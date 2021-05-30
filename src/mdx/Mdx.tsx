import { components } from '@/mdx/components'
import { useMdx } from '@/mdx/useMdx'

export interface MdxProps {
  code: string
}

/**
 * Renders pre-compiled mdx content.
 */
export function Mdx(props: MdxProps): JSX.Element {
  const { MdxContent, metadata } = useMdx(props.code)

  return <MdxContent {...metadata} components={components} />
}
