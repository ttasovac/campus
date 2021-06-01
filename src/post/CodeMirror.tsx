import type { Ref } from 'react'
import { forwardRef } from 'react'

/**
 * Container for CodeMirror editor.
 */
export const CodeMirror = forwardRef(_CodeMirror)

function _CodeMirror(_props: unknown, ref: Ref<HTMLDivElement>): JSX.Element {
  return <div ref={ref} />
}
