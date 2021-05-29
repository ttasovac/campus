import type { Locale } from '@/i18n/i18n.config'
import { url } from '~/config/site.config'

export interface SiteMetadata {
  url: string
  title: string
  shortTitle?: string
  description: string
  favicon: {
    src: string
  }
  image: {
    src: string
    alt: string
  }
  twitter?: {
    handle: string
  }
}

/**
 * Site metadata for all supported locales.
 */
export const siteMetadata: Record<Locale, SiteMetadata> = {
  en: {
    url: new URL('en', url).toString(),
    title: 'Campus',
    shortTitle: 'Campus',
    description: '',
    favicon: {
      src: 'public/assets/images/logo.svg',
    },
    image: {
      src: '/android-chrome-512x512.png',
      alt: '',
    },
    twitter: {
      handle: '',
    },
  },
} as const
