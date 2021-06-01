import { Fragment } from 'react'

import { Svg as PlayIcon } from '@/assets/icons/play.svg'
import { Icon } from '@/common/Icon'
import { LightBox } from '@/common/LightBox'
import { YouTube } from '@/common/YouTube'
import { useDialogState } from '@/common/useDialogState'
import type { FilePath } from '@/utils/ts/aliases'

export interface VideoCardProps {
  id: string
  title: string
  subtitle: string
  image: FilePath
  provider?: 'youtube'
}

/**
 * Video card.
 */
export function VideoCard(props: VideoCardProps): JSX.Element {
  const lightbox = useDialogState()

  const VideoProvider = YouTube

  return (
    <Fragment>
      <button
        onClick={lightbox.open}
        className="flex flex-col items-center p-12 space-y-4 transition rounded shadow-lg text-neutral-800 hover:shadow-xl"
      >
        <img src={props.image} alt="" loading="lazy" />
        <Icon icon={PlayIcon} className="w-16 h-16 text-primary-600" />
        <strong className="text-2xl font-bold">{props.title}</strong>
        <p className="text-neutral-500">{props.subtitle}</p>
      </button>
      <LightBox {...lightbox}>
        <VideoProvider id={props.id} />
      </LightBox>
    </Fragment>
  )
}
