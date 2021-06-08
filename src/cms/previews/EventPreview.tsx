import type { PreviewTemplateComponentProps } from 'netlify-cms-core'
import { useState, useEffect } from 'react'
import { compile } from 'xdm'

import type { Event as EventData, EventFrontmatter } from '@/api/cms/event'
import { Preview } from '@/cms/Preview'
import { useDebouncedState } from '@/common/useDebouncedState'
import { Event } from '@/event/Event'

/**
 * CMS preview for event resource.
 *
 * TODO: Don't recompile mdx when only metadata changes.
 */
export function EventPreview(
  props: PreviewTemplateComponentProps,
): JSX.Element {
  const entry = useDebouncedState(props.entry, 250)
  const fieldsMetaData = useDebouncedState(props.fieldsMetaData, 250)
  const [event, setEvent] = useState<EventData | null | undefined>(undefined)

  useEffect(() => {
    let wasCanceled = false

    async function compileMdx() {
      try {
        const { body, ...partialFrontmatter } = entry.get('data').toJS()
        const frontmatter = partialFrontmatter as Partial<EventFrontmatter>

        const id = entry.get('slug')

        // TODO:

        const metadata = {
          ...frontmatter,
        }

        const code = String(
          await compile(body, {
            outputFormat: 'function-body',
            useDynamicImport: false,
            // FIXME: plugins like syntax highlighter
          }),
        )

        const event = {
          id,
          code,
          data: {
            metadata,
            toc: [],
          },
        } as EventData

        if (!wasCanceled) {
          setEvent(event)
        }
      } catch {
        setEvent(null)
      }

      return () => {
        wasCanceled = true
      }
    }

    compileMdx()
  }, [entry, fieldsMetaData])

  return (
    <Preview {...props}>
      {event == null ? (
        event === undefined ? null : (
          <div>
            <p>Failed to render preview.</p>
            <p>
              This usually indicates a syntax error in the Markdown content.
            </p>
          </div>
        )
      ) : (
        <Event event={event} lastUpdatedAt={null} isPreview />
      )}
    </Preview>
  )
}
