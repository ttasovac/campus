import '@reach/dialog/styles.css'

import { DialogContent, DialogOverlay } from '@reach/dialog'
import { Fragment } from 'react'

import { Svg as CloseIcon } from '@/assets/icons/close.svg'
import { Svg as MenuIcon } from '@/assets/icons/menu.svg'
import { Icon } from '@/common/Icon'
import type { TableOfContentsProps } from '@/common/TableOfContents'
import { TableOfContents } from '@/common/TableOfContents'
import { useDialogState } from '@/common/useDialogState'

export interface FloatingTableOfContentsButtonProps {
  toc: TableOfContentsProps['toc']
}

/**
 * Floating table of contents.
 */
export function FloatingTableOfContentsButton(
  props: FloatingTableOfContentsButtonProps,
): JSX.Element {
  const state = useDialogState()

  return (
    <Fragment>
      <button
        onClick={state.toggle}
        className="fixed p-4 text-white transition rounded-full bottom-5 right-5 hover:bg-primary-700 bg-primary-600 2xl:hidden focus:outline-none focus-visible:ring focus-visible:ring-primary-600"
      >
        <Icon icon={MenuIcon} className="w-5 h-5" />
        <span className="sr-only">Table of contents</span>
      </button>
      <DialogOverlay
        isOpen={state.isOpen}
        onDismiss={state.close}
        className="z-10"
      >
        <DialogContent
          aria-label="Table of contents"
          className="rounded-xl shadow-card flex flex-col space-y-2"
        >
          <button
            onClick={state.close}
            aria-label="Close"
            className="self-end rounded-full p-2 transition hover:bg-neutral-100 focus:outline-none focus-visible:ring focus-visible:ring-primary-600"
          >
            <Icon icon={CloseIcon} className="w-6 h-6" />
          </button>
          <TableOfContents
            toc={props.toc}
            title={
              <h2 className="text-sm font-bold tracking-wide uppercase text-neutral-600">{`Table of contents`}</h2>
            }
            className="space-y-2"
          />
        </DialogContent>
      </DialogOverlay>
    </Fragment>
  )
}
