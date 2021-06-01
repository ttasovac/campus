const BASE_URL = 'https://www.youtube-nocookie.com/embed/'

export interface YouTubeProps {
  id: string
  /** @default false */
  autoPlay?: boolean
  /** In seconds. */
  startTime?: number
  caption?: string
}

/**
 * YouTube video.
 */
export function YouTube(props: YouTubeProps): JSX.Element {
  const url = useYouTube(props.id, props.autoPlay, props.startTime)

  return (
    <figure className="flex flex-col items-center justify-center aspect-w-16 aspect-h-9">
      <iframe
        src={String(url)}
        title="YouTube video player"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        loading="lazy"
      />
      {props.caption !== undefined ? (
        <figcaption className="py-2 font-medium">{props.caption}</figcaption>
      ) : null}
    </figure>
  )
}

function useYouTube(id: string, autoPlay = false, startTime?: number) {
  const embedUrl = new URL(id, BASE_URL)

  if (autoPlay === true) {
    embedUrl.searchParams.set('autoplay', String(1))
  }
  if (startTime !== undefined) {
    embedUrl.searchParams.set('start', String(startTime))
  }

  return embedUrl
}
