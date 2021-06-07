import type { EventPreview } from '@/api/cms/event'
import { getEventPreviews } from '@/api/cms/event'
import type { Locale } from '@/i18n/i18n.config'

/**
 * Returns metadata for events filtered by tag id.
 */
export async function getEventPreviewsByTagId(
  id: string,
  locale: Locale,
): Promise<Array<EventPreview>> {
  const eventPreviews = await getEventPreviews(locale)

  const eventsByTag = eventPreviews.filter((event) =>
    event.tags.some((tag) => tag.id === id),
  )

  return eventsByTag
}
