import { Svg as EmailIcon } from '@/assets/icons/email.svg'
import { Svg as FlickrIcon } from '@/assets/icons/flickr.svg'
import { Svg as GitHubIcon } from '@/assets/icons/github.svg'
import { Svg as GlobeIcon } from '@/assets/icons/globe.svg'
import { Svg as TwitterIcon } from '@/assets/icons/twitter.svg'
import { Svg as YouTubeIcon } from '@/assets/icons/youtube.svg'

/**
 * Social links.
 */
export const social = {
  twitter: {
    href: 'https://twitter.com/dariaheu',
    label: 'Twitter',
    icon: TwitterIcon,
  },
  flickr: {
    href: 'https://www.flickr.com/photos/142235661@N08/albums/with/72157695786965901',
    label: 'Flickr',
    icon: FlickrIcon,
  },
  youtube: {
    href: 'https://www.youtube.com/channel/UCeQpM_gUvNZXUWf6qQ226GQ',
    label: 'YouTube',
    icon: YouTubeIcon,
  },
  github: {
    href: 'https://github.com/DARIAH-ERIC',
    label: 'GitHub',
    icon: GitHubIcon,
  },
  email: {
    href: 'https://www.dariah.eu/helpdesk/',
    label: 'Email',
    icon: EmailIcon,
  },
  website: {
    href: 'https://www.dariah.eu/',
    label: 'Website',
    icon: GlobeIcon,
  },
}
