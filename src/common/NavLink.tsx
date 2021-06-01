import cx from 'clsx'
import Link from 'next/link'

import type { UseCurrentUrlProps } from '@/navigation/useCurrentUrl'
import { useCurrentUrl } from '@/navigation/useCurrentUrl'

export interface NavLinkProps
  extends Omit<JSX.IntrinsicElements['a'], 'href'>,
    UseCurrentUrlProps {
  activeClassName?: string
  inactiveClassName?: string
}

/**
 * NavLink.
 *
 * Sets `aria-current` when `href` matches the current route.
 */
export function NavLink(props: NavLinkProps): JSX.Element {
  const {
    children,
    href,
    isCurrentUrl,
    className,
    activeClassName,
    inactiveClassName,
    ...anchorProps
  } = props
  const isCurrent = useCurrentUrl({ href, isCurrentUrl })

  return (
    <Link href={href}>
      <a
        {...anchorProps}
        aria-current={isCurrent ? 'page' : undefined}
        className={cx(
          className,
          isCurrent ? activeClassName : inactiveClassName,
        )}
      >
        {children}
      </a>
    </Link>
  )
}
