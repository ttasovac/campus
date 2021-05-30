import type { PreviewTemplateComponentProps } from 'netlify-cms-core'
import type { ReactNode } from 'react'
import { Fragment, useEffect } from 'react'
import { Fonts } from '@/assets/Fonts'

export interface PreviewProps extends PreviewTemplateComponentProps {
  children?: ReactNode
}

/**
 * Shared wrapper for CMS previews.
 */
export function Preview(props: PreviewProps): JSX.Element {
  // @ts-expect-error Missing in upstream type.
  const { document } = props

  useEffect(() => {
    const roboto = document.createElement('link')
    roboto.href =
      'https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700;900&display=swap'
    roboto.rel = 'stylesheet'
    document.head.append(roboto)

    const tailwind = document.createElement('link')
    tailwind.href = '/assets/css/tailwind.css'
    tailwind.rel = 'stylesheet'
    document.head.append(tailwind)

    const styles = document.createElement('link')
    styles.href = '/assets/css/index.css'
    styles.rel = 'stylesheet'
    document.head.append(styles)
  }, [document])

  return <Fragment>{props.children}</Fragment>
}
