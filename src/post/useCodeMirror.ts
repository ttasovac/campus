import { basicSetup, EditorState, EditorView } from '@codemirror/basic-setup'
import { xml } from '@codemirror/lang-xml'
import type { RefObject } from 'react'
import { useEffect, useState } from 'react'

/**
 * Creates code mirror editor view.
 */
export function useCodeMirror(
  ref: RefObject<HTMLElement>,
  initialValue?: string,
): {
  editor: EditorView | null
  getDocument: () => string
  getSelection: () => string
} {
  const [editor, setEditor] = useState<EditorView | null>(null)

  function getDocument(): string {
    if (editor === null) return ''

    const doc = editor.state.doc.toString()

    return doc
  }

  function getSelection(): string {
    if (editor === null) return ''

    const selection = editor.state
      .sliceDoc(
        editor.state.selection.main.from,
        editor.state.selection.main.to,
      )
      .toString()

    return selection
  }

  useEffect(() => {
    if (ref.current === null) return

    const styles = EditorView.theme({
      '.cm-focused': { outline: 'none' },
      '.cm-scroller': { overflow: 'auto' },
      '.cm-content': {
        fontFamily: '"Fira Code", "Source Code Pro", ui-monospace, monospace',
        fontSize: '14px',
      },
    })

    const view = new EditorView({
      state: EditorState.create({
        extensions: [styles, basicSetup, xml()],
        doc: initialValue,
      }),
      parent: ref.current,
    })

    setEditor(view)

    return () => {
      view.destroy()
    }
  }, [ref, initialValue])

  return {
    editor,
    getDocument,
    getSelection,
  }
}
