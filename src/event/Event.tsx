import type { Event as EventData } from '@/api/cms/event'
import { Mdx as EventContent } from '@/mdx/Mdx'
import type { ISODateString } from '@/utils/ts/aliases'

export interface EventProps {
  event: EventData
  lastUpdatedAt: ISODateString | null
  isPreview?: boolean
}

/**
 * Event resource.
 */
export function Event(props: EventProps): JSX.Element {
  const { event, lastUpdatedAt, isPreview } = props
  const { metadata } = event.data

  return (
    <article>
      <pre>{JSON.stringify(props.event, null, 2)}</pre>
      <EventContent {...event} />
    </article>
  )
}
