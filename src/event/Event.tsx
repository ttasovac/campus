// import '@/event/styles/base.module.scss'
import '@reach/dialog/styles.css'

import { DialogContent, DialogOverlay } from '@reach/dialog'
import cx from 'clsx'
import type { ReactNode } from 'react'
import { Fragment } from 'react'
import {
  FaEnvelope,
  FaGlobe,
  FaTwitter,
  FaFlickr,
  FaFilePdf,
} from 'react-icons/fa'

import type { Event as EventData } from '@/api/cms/event'
import { Svg as CloseIcon } from '@/assets/icons/close.svg'
import { Icon } from '@/common/Icon'
import type { DialogState } from '@/common/useDialogState'
import { useDialogState } from '@/common/useDialogState'
import { Mdx as EventContent, Mdx } from '@/mdx/Mdx'
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
    <Fragment>
      <EventOverview event={event} />
      <div className="body__borders">
        {/* <EventSessions sessions={sessions.nodes} downloads={downloads.nodes} />
        <EventSideNav sessions={sessions.nodes} /> */}
      </div>
      <EventFooter event={event} />
    </Fragment>
  )
}

interface EventOverviewProps {
  event: EventProps['event']
}

/**
 * Event overview.
 */
function EventOverview(props: EventOverviewProps) {
  const { event } = props
  const { metadata } = event.data
  const { about, prep, featuredImage, logo, sessions, social } = metadata

  const aboutDialog = useDialogState()
  const prepDialog = useDialogState()

  return (
    <section id="body" className="home min-h-screen">
      {featuredImage != null ? (
        <div className="absolute inset-0">
          <img src={featuredImage} alt="" className="" loading="lazy" />
          {/* TODO: 0.65 opacity black */}
          <div className="bg-gradient-to-b from-transparent via-transparent to-black absolute inset-0" />
        </div>
      ) : null}

      <div className="home__wrapper-1">
        <div className="home__wrapper-2">
          <div className="home__wrapper-3">
            <div className="home__main relative">
              {logo != null ? (
                <div
                  className="absolute bottom-full w-48"
                  style={{ left: '-3.25vw' }}
                >
                  <img src={logo} alt="" className="" loading="lazy" />
                </div>
              ) : null}

              <EventContent
                {...event}
                // TODO: components={{ a: Link, h1: EventTitle, h2: EventSubtitle, p: EventIntro }}
              />

              <EventToc sessions={sessions} />
            </div>

            <aside className="home__aside">
              <EventSocialLinks social={social} />
              <EventNav
                hasAboutOverlay={Boolean(metadata.about)}
                hasPrepOverlay={Boolean(metadata.prep)}
                aboutDialog={aboutDialog}
                prepDialog={prepDialog}
                social={metadata.social}
                synthesis={metadata.synthesis}
              />
            </aside>
          </div>
        </div>
      </div>

      {aboutDialog.isOpen ? (
        <EventOverlay
          content={<Mdx code={about.code} />}
          onDismiss={aboutDialog.close}
        />
      ) : null}

      {prepDialog.isOpen && prep != null ? (
        <EventOverlay
          content={<Mdx code={prep.code} />}
          onDismiss={prepDialog.close}
        />
      ) : null}
    </section>
  )
}

interface EventOverlayProps {
  content: ReactNode
  onDismiss: () => void
}

/**
 * Event overlay.
 */
function EventOverlay(props: EventOverlayProps) {
  const { content, onDismiss } = props

  return (
    <DialogOverlay onDismiss={onDismiss}>
      <DialogContent>
        <div className="popin-content block" style={{ margin: '3.125vw auto' }}>
          <button onClick={onDismiss} className="rounded-full">
            <span className="sr-only">Close</span>
            <Icon
              icon={CloseIcon}
              className="popin-closer button-picto button-picto--naked show-hide-close"
            />
          </button>

          <div className="popin-core">{content}</div>
        </div>
      </DialogContent>
    </DialogOverlay>
  )
}

interface EventTocProps {
  sessions: EventProps['event']['data']['metadata']['sessions']
}

/**
 * Event table of contents (sessions).
 */
function EventToc(props: EventTocProps) {
  const { sessions } = props

  return (
    <ul className="home__index">
      {sessions.map((session, index) => (
        <li key={index}>
          <a href={`#session-${index + 1}`}>
            <small>
              <span>
                <i>Session</i> {index + 1}
              </span>
            </small>
            <strong>{session.title}</strong>
          </a>
        </li>
      ))}
    </ul>
  )
}

interface EventSocialLinksProps {
  social: EventProps['event']['data']['metadata']['social']
}

/**
 * Event social media links.
 */
function EventSocialLinks(props: EventSocialLinksProps) {
  const { social } = props

  if (social == null) return null

  return (
    <ul className="home__share">
      {social.twitter != null ? (
        <li style={{ marginRight: '1rem' }}>
          <a
            href={String(new URL(social.twitter, 'https://twitter.com'))}
            className="home__share__twitter"
            aria-label="Share on Twitter"
          >
            <div className="flex items-center justify-center h-full relative">
              <FaTwitter />
            </div>
          </a>
        </li>
      ) : null}
      {social.website != null ? (
        <li style={{ marginRight: '1rem' }}>
          <a href={social.website} aria-label="Visit website">
            <div className="flex items-center justify-center h-full relative">
              <FaGlobe />
            </div>
          </a>
        </li>
      ) : null}
      {social.email != null ? (
        <li style={{ marginRight: '1rem' }}>
          <a href={`mailto:${social.email}`} aria-label="Contact">
            <div className="flex items-center justify-center h-full relative">
              <FaEnvelope />
            </div>
          </a>
        </li>
      ) : null}
    </ul>
  )
}

interface EventNavProps {
  social: EventProps['event']['data']['metadata']['social']
  synthesis: EventProps['event']['data']['metadata']['synthesis']
  aboutDialog: DialogState
  prepDialog: DialogState
  hasAboutOverlay: boolean
  hasPrepOverlay: boolean
}

/**
 *
 */
function EventNav(props: EventNavProps) {
  const {
    hasAboutOverlay,
    aboutDialog,
    hasPrepOverlay,
    prepDialog,
    social,
    synthesis,
  } = props

  return (
    <div>
      <ul className="home__links">
        {hasAboutOverlay ? (
          <li>
            <button
              onClick={aboutDialog.open}
              className={cx(
                'link-popin',
                'transition text-white opacity-50 duration-300 hover:duration-150 hover:opacity-100',
              )}
            >
              <span>About</span>
            </button>
          </li>
        ) : null}
        {hasPrepOverlay ? (
          <li>
            <button
              onClick={prepDialog.open}
              className={cx(
                'link-popin',
                'transition text-white opacity-50 duration-300 hover:duration-150 hover:opacity-100',
              )}
            >
              <span>How to prepare</span>
            </button>
          </li>
        ) : null}
        {social?.flickr != null ? (
          <li>
            <a href={social.flickr}>
              <FaFlickr size="0.75em" className="mr-4" />
              <span>See the photos</span>
            </a>
          </li>
        ) : null}
        {synthesis != null ? (
          <li className="download">
            <a href={synthesis}>
              <FaFilePdf size="0.75em" className="mr-4" />
              <span>Download the full synthesis (PDF, {synthesis})</span>
            </a>
          </li>
        ) : null}
      </ul>

      <p className="home__more">
        You can annotate and discuss all the material here with the{' '}
        <a href="https://hypothes.is/">hypothes.is</a> plugin.
      </p>
    </div>
  )
}

interface EventFooterProps {
  event: EventProps['event']
}

/**
 * Event overview.
 */
function EventFooter(props: EventFooterProps) {
  const { event } = props

  return <footer></footer>
}
