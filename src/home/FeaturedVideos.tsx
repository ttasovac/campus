import { Fragment } from 'react'

import { Svg as PlayIcon } from '@/assets/icons/play.svg'
import { Icon } from '@/common/Icon'
import { LightBox } from '@/common/LightBox'
import { Section } from '@/common/Section'
import { YouTube } from '@/common/YouTube'
import { useDialogState } from '@/common/useDialogState'
import type { HomePageProps } from '@/pages/index.page'

export interface FeaturedVideosProps {
  videos: HomePageProps['videos']
}

/**
 * Videos section on home page.
 */
export function FeaturedVideos(props: FeaturedVideosProps): JSX.Element {
  return (
    <Section>
      <Section.Title>Why training and education?</Section.Title>
      <Section.LeadIn>
        Some thoughts on why training and education matter so much for a
        research infrastructure such as DARIAH
      </Section.LeadIn>
      <ul className="grid gap-8 py-6 md:grid-cols-3">
        {props.videos.map((video, index) => {
          return (
            <li key={index}>
              <VideoCard {...video} />
            </li>
          )
        })}
      </ul>
    </Section>
  )
}

type VideoCardProps = FeaturedVideosProps['videos'][number]

function VideoCard(props: VideoCardProps) {
  const lightbox = useDialogState()

  const VideoProvider = YouTube

  return (
    <Fragment>
      <button
        onClick={lightbox.open}
        className="flex flex-col items-center p-6 space-y-4 transition rounded-xl shadow-card-md text-neutral-800 hover:shadow-card-lg focus-visible:ring focus-visible:ring-primary-600 focus-visible:ring-offset-2 focus:outline-none"
      >
        <img src={props.image} alt="" loading="lazy" className="w-full" />
        <Icon icon={PlayIcon} className="w-12 h-12 text-primary-600" />
        <div className="flex flex-col space-y-1">
          <strong className="text-xl font-bold">{props.title}</strong>
          <p className="text-neutral-500">{props.subtitle}</p>
        </div>
      </button>
      <LightBox {...lightbox}>
        <VideoProvider id={props.id} />
      </LightBox>
    </Fragment>
  )
}
