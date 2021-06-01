import { Svg as CampusLogo } from '~/public/assets/images/logo.svg'

export interface LogoProps {
  className?: string
  'aria-hidden'?: boolean
  'aria-label'?: string
}

/**
 * Logo.
 */
export function Logo(props: LogoProps): JSX.Element {
  const hidden = props['aria-hidden'] ?? props['aria-label'] === undefined

  return (
    <CampusLogo
      aria-hidden={hidden}
      aria-label={props['aria-label']}
      className={props.className}
    />
  )
}
