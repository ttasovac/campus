import type { LinkProps } from 'next/link'
import type { NextRouter } from 'next/router'
import { useRouter } from 'next/router'

import { createUrl } from '@/utils/createUrl'
import { removeTrailingSlash } from '@/utils/removeTrailingSlash'

export interface IsCurrentUrlProps {
  current: {
    route: NextRouter['route']
    href: NextRouter['asPath']
  }
  href: LinkProps['href']
}

export interface UseCurrentUrlProps {
  href: LinkProps['href']
  isCurrentUrl?: (props: IsCurrentUrlProps) => boolean
}

/**
 * Returns whether the provided href matches the current route.
 *
 * By default, pathnames are matched exactly, and query params are ignored.
 */
export function useCurrentUrl(props: UseCurrentUrlProps): boolean {
  const { isCurrentUrl = isMatchingPathname } = props
  const router = useRouter()

  const isCurrent = isCurrentUrl({
    current: {
      route: router.route,
      href: router.asPath,
    },
    href: props.href,
  })

  return isCurrent
}

/**
 * Matches by pathname, ignoring query params.
 */
function isMatchingPathname({ current, href }: IsCurrentUrlProps): boolean {
  const { pathname } =
    typeof href === 'string' ? createUrl({ path: href }) : href
  if (pathname == null) return false
  const { pathname: currentPathname } = createUrl({ path: current.href })
  return removeTrailingSlash(pathname) === removeTrailingSlash(currentPathname)
}
