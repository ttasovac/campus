import { routes } from '@/navigation/routes.config'

/**
 * Links for navigation menu.
 */
export const navigation = {
  home: {
    href: routes.home(),
  },
  resources: {
    href: routes.resources(),
  },
  topics: {
    href: routes.tags(),
  },
  sources: {
    href: routes.sources(),
  },
  courseRegistry: {
    href: routes.courseRegistry(),
  },
  about: {
    href: routes.docs('about'),
  },
  contact: {
    href: `https://www.dariah.eu/helpdesk/`,
  },
} as const
