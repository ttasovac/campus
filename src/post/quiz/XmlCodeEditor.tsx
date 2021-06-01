import { useMemo, useRef } from 'react'
import type { ReactNode } from 'react'

import { CodeMirror } from '@/post/CodeMirror'
import { QuizCardStatus, useQuiz } from '@/post/quiz/Quiz'
import { QuizCardLayout } from '@/post/quiz/QuizCardLayout'
import { useCodeMirror } from '@/post/useCodeMirror'

export interface XmlCodeEditorProps {
  children?: ReactNode
  code: string
  solution: string
  /** @default "document" */
  validate?: 'document' | 'selection'
}

/**
 * XML code editor with syntax highlighting.
 */
export function XmlCodeEditor(props: XmlCodeEditorProps): JSX.Element {
  const quiz = useQuiz()

  const ref = useRef<HTMLDivElement>(null)
  const { getDocument, getSelection } = useCodeMirror(ref, props.code)
  const solution = useMemo(
    () => createDocumentFragment(normalizeWhitespace(props.solution)),
    [props.solution],
  )

  function onValidate() {
    const input =
      props.validate === 'selection' ? getSelection() : getDocument()

    /**
     * Use a document fragment, because `DOMParser` requires full documents,
     * i.e. the following won't work:
     * ```js
     * new DOMParser().parseFromString('<p>Hello</p><p>World</p>')
     * ```
     * However, `createDocumentFragment` does not seem to handle xml declarations.
     */
    try {
      const isCorrect = createDocumentFragment(
        normalizeWhitespace(input),
      ).isEqualNode(solution)

      quiz.setStatus(
        isCorrect ? QuizCardStatus.CORRECT : QuizCardStatus.INCORRECT,
      )
    } catch {
      quiz.setStatus(QuizCardStatus.INCORRECT)
    }
  }

  const component = <CodeMirror ref={ref} />

  return (
    <QuizCardLayout component={component} onValidate={onValidate}>
      {props.children}
    </QuizCardLayout>
  )
}

XmlCodeEditor.isQuizCard = true

/**
 * Parses html string into document fragment.
 */
function createDocumentFragment(html: string) {
  /** Creates a XMLDocument. */
  const doc = new Document()
  const template = doc.createElement('template')
  /** Uses XML fragment parsing. */
  template.innerHTML = html
  /**
   * While html templates have the document fragment on `template.content`,
   * in xml mode the `template` itself poses as the content container.
   */
  return template
}

/**
 * Removes whitespace-only text nodes, trims leading/trailing whitespace from text nodes
 * and collapses multiple consecutive whitespace characters into one space.
 *
 * Whitespace in inline formatting contexts is not preserved correctly, but this should
 * not matter here.
 */
function normalizeWhitespace(html: string) {
  return html.trim().replace(/>\s+/g, '>').replace(/<\s+/g, '<')
}

// function normalizeWhitespaceDom(dom) {
//   for (let i = 0; i < dom.childNodes.length; i++) {
//     const node = dom.childNodes[i]
//     if (node.nodeType === Node.COMMENT_NODE) {
//       node.remove()
//       i--
//     } else if (node.nodeType === Node.TEXT_NODE) {
//       node.textContent = node.textContent.trim()
//       if (node.textContent.length === 0) {
//         node.remove()
//         i--
//       }
//     } else if (node.nodeType === Node.ELEMENT_NODE) {
//       normalizeWhitespaceDom(node)
//     }
//   }
// }
