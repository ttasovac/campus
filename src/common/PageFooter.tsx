import { Icon } from '@/common/Icon'
import { NavLink } from '@/common/NavLink'
import { useI18n } from '@/i18n/useI18n'
import { navigation } from '@/navigation/navigation.config'
import { social } from '@/navigation/social.config'
import { Svg as ByLogo } from '~/public/assets/images/by.svg'
import { Svg as CcLogo } from '~/public/assets/images/cc.svg'
import { Svg as EuLogo } from '~/public/assets/images/eu-flag.svg'

/**
 * PageFooter.
 */
export function PageFooter(): JSX.Element {
  const { t } = useI18n()

  return (
    <footer className="flex flex-col px-8 py-8 space-y-6 text-sm font-medium bg-secondary-800 text-neutral-400">
      <nav>
        <ul className="flex flex-col items-center justify-center space-y-3 md:space-y-0 md:space-x-6 md:flex-row">
          {Object.entries(navigation).map(([key, link]) => {
            return (
              <li key={key}>
                <NavLink
                  href={link.href}
                  activeClassName="text-white"
                  className="p-2 rounded focus:outline-none focus-visible:ring focus-visible:ring-neutral-400"
                >
                  {t(`common.page.${key}`)}
                </NavLink>
              </li>
            )
          })}
        </ul>
      </nav>
      <div>
        <ul className="flex items-center justify-center space-x-6">
          {Object.entries(social).map(([key, link]) => {
            return (
              <li key={key}>
                <a
                  href={link.href}
                  aria-label={link.label}
                  className="inline-block p-2 rounded focus:outline-none focus-visible:ring focus-visible:ring-neutral-400"
                >
                  <Icon icon={link.icon} className="w-4 h-4" />
                </a>
              </li>
            )
          })}
        </ul>
      </div>
      <div className="font-normal flex items-center justify-between space-x-8 text-xs max-w-screen-lg mx-auto">
        <div className="flex items-center space-x-4">
          <EuLogo className="flex-shrink-0 h-6" />
          <span>
            Co-funded by the Horizon 2020 innovation and research programme of
            the European Union under grant no. 731081.
          </span>
        </div>
        <div className="flex items-center justify-end space-x-4">
          <span className="text-right">
            Except where otherwise noted, content on this site is licensed under
            a Creative Commons Attribution 4.0 International license.
          </span>
          <span className="flex items-center flex-shrink-0">
            <CcLogo className="w-6 h-6" />
            <ByLogo className="w-6 h-6" />
          </span>
        </div>
      </div>
    </footer>
  )
}
