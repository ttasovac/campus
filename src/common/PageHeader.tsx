import '@reach/combobox/styles.css'

import { DialogContent, DialogOverlay } from '@reach/dialog'
import cx from 'clsx'
import { useRouter } from 'next/router'
import { Fragment, useEffect, useState } from 'react'

import { Svg as CloseIcon } from '@/assets/icons/close.svg'
import { Svg as MenuIcon } from '@/assets/icons/menu.svg'
import { Svg as SearchIcon } from '@/assets/icons/search.svg'
import { Icon } from '@/common/Icon'
import { Logo } from '@/common/Logo'
import { NavLink } from '@/common/NavLink'
import { useDialogState } from '@/common/useDialogState'
import { useI18n } from '@/i18n/useI18n'
import { navigation } from '@/navigation/navigation.config'

/**
 * PageHeader.
 */
export function PageHeader(): JSX.Element {
  const { t } = useI18n()
  const isShadowVisible = useScrollShadow()

  return (
    <header
      className={cx(
        'fixed inset-x-0 z-10 bg-white',
        isShadowVisible && 'shadow',
      )}
    >
      <nav className="flex items-center justify-between px-4 py-4 space-x-4 text-neutral-800">
        <div>
          <NavLink
            href={navigation.home.href}
            aria-label={t('common.page.home')}
            className="inline-block rounded focus:outline-none focus-visible:ring focus-visible:ring-primary-600"
          >
            <Logo aria-hidden className="h-12 text-primary-600" />
          </NavLink>
        </div>
        <div className="hidden md:flex md:items-center md:flex-1 md:justify-between">
          <NavigationBar />
        </div>
        <div className="flex md:hidden">
          <NavigationMenu />
        </div>
      </nav>
    </header>
  )
}

/**
 * Navigation links for desktop viewports.
 */
function NavigationBar() {
  const { home: _, contact, ...links } = navigation

  const { t } = useI18n()

  return (
    <Fragment>
      <ul className="flex items-center text-sm font-medium">
        {Object.entries(links).map(([key, link]) => {
          return (
            <li key={key}>
              <NavLink
                href={link.href}
                className="flex px-4 py-4 transition rounded hover:text-primary-600 focus:outline-none focus-visible:ring focus-visible:ring-primary-600"
              >
                {t(`common.page.${key}`)}
              </NavLink>
            </li>
          )
        })}
      </ul>
      <div className="flex items-center space-x-4">
        <SearchButton />
        <a
          href={contact.href}
          target="_blank"
          rel="noopener noreferrer"
          className="px-3 py-1.5 text-sm font-medium border rounded-full border-primary-600 text-primary-600 transition hover:text-white hover:bg-primary-600 focus:outline-none focus-visible:ring focus-visible:ring-primary-600"
        >
          {t('common.page.contact')}
        </a>
      </div>
    </Fragment>
  )
}

/**
 * Navigation menu for mobile viewports.
 */
function NavigationMenu() {
  const { contact, ...links } = navigation

  const router = useRouter()
  const { t } = useI18n()
  const state = useDialogState()

  useEffect(() => {
    router.events.on('routeChangeStart', state.close)

    return () => {
      router.events.off('routeChangeStart', state.close)
    }
  }, [router, state.close])

  return (
    <Fragment>
      <button
        onClick={state.toggle}
        className="flex items-center space-x-2 text-sm transition hover:text-primary-600 focus:outline-none focus-visible:ring focus-visible:ring-primary-600"
      >
        <span>Menu</span>
        <Icon icon={MenuIcon} className="w-5 h-5" />
      </button>
      <DialogOverlay
        isOpen={state.isOpen}
        onDismiss={state.close}
        className="fixed inset-0 z-20 transition bg-opacity-25 bg-neutral-900"
      >
        <DialogContent
          aria-label="Navigation menu"
          className="absolute inset-y-0 right-0 flex flex-col justify-between p-4 space-y-4 text-neutral-400 bg-neutral-800"
        >
          <button
            onClick={state.close}
            className="absolute self-end rounded focus:outline-none focus-visible:ring focus-visible:ring-neutral-400"
          >
            <span className="sr-only">Close navigation menu</span>
            <Icon
              icon={CloseIcon}
              className="w-10 h-10 p-2 transition rounded-full hover:bg-neutral-700"
            />
          </button>
          <ul className="flex flex-col px-2 py-4">
            {Object.entries(links).map(([key, link]) => {
              return (
                <li key={key}>
                  <NavLink
                    href={link.href}
                    className="block px-4 py-4 transition rounded hover:text-white focus:outline-none focus-visible:ring focus-visible:ring-neutral-400"
                  >
                    {t(`common.page.${key}`)}
                  </NavLink>
                </li>
              )
            })}
          </ul>
          <div>
            <a
              href={contact.href}
              target="_blank"
              rel="noopener noreferrer"
              className="block px-4 py-4 transition rounded hover:text-white focus:outline-none focus-visible:ring focus-visible:ring-neutral-400"
            >
              {t('common.page.contact')}
            </a>
          </div>
        </DialogContent>
      </DialogOverlay>
    </Fragment>
  )
}

/**
 * Button for Algolia search dialog.
 */
function SearchButton() {
  return (
    <button className="flex items-center p-4 space-x-1 text-sm font-medium transition rounded hover:text-primary-600 focus:outline-none focus-visible:ring focus-visible:ring-primary-600">
      <Icon icon={SearchIcon} className="w-5 h-5" />
      <span>Search</span>
    </button>
  )
}

/**
 * Show shadow on page header when scrolled down.
 */
function useScrollShadow() {
  const [isShadowVisible, setIsShadowVisible] = useState(false)

  useEffect(() => {
    function setShadow() {
      if (window.scrollY === 0) {
        setIsShadowVisible(false)
      } else {
        setIsShadowVisible(true)
      }
    }

    window.addEventListener('scroll', setShadow, { passive: true })

    return () => {
      window.removeEventListener('scroll', setShadow)
    }
  }, [])

  return isShadowVisible
}
