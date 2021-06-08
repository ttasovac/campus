import ErrorBoundary, { useError } from '@stefanprobst/next-error-boundary'
import type { PreviewTemplateComponentProps } from 'netlify-cms-core'
import type { ReactNode } from 'react'
import { useEffect } from 'react'

import { Fonts } from '@/assets/Fonts'
import { I18nProvider } from '@/i18n/I18n.context'

export interface PreviewProps extends PreviewTemplateComponentProps {
  children?: ReactNode
}

/**
 * Shared wrapper for CMS previews.
 */
export function Preview(props: PreviewProps): JSX.Element {
  const { document } = props
  const locale = props.entry.getIn(['data', 'lang'], 'en')

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

  return (
    <ErrorBoundary fallback={ErrorFallback}>
      <I18nProvider locale={locale} dictionary={undefined}>
        <div className="flex flex-col p-8">{props.children}</div>
      </I18nProvider>
    </ErrorBoundary>
  )
}

/**
 * Error boundary fallback.
 */
function ErrorFallback() {
  const { error, onReset } = useError()

  return (
    <div className="grid place-items-center h-96">
      <div className="text-center space-y-2">
        <p>An unexpected error has occurred: {error.message}.</p>
        <button
          onClick={onReset}
          className="rounded bg-primary-600 text-white text-sm font-medium px-6 py-2 transition hover:bg-primary-700 focus:outline-none focus-visible:ring focus-visible:ring-primary-600"
        >
          Clear errors.
        </button>
      </div>
    </div>
  )
}
