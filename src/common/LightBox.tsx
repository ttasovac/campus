import { DialogContent, DialogOverlay } from '@reach/dialog'
import type { ReactNode } from 'react'

import { Svg as CloseIcon } from '@/assets/icons/close.svg'
import { Icon } from '@/common/Icon'
import type { DialogState } from '@/common/useDialogState'

export interface LightBoxProps extends DialogState {
  children: ReactNode
  caption?: string
}

/**
 * LightBox.
 */
export function LightBox(props: LightBoxProps): JSX.Element {
  return (
    <DialogOverlay
      isOpen={props.isOpen}
      onDismiss={props.close}
      className="fixed inset-0 z-20"
    >
      <DialogContent
        aria-label="Media lightbox"
        className="absolute inset-0 flex flex-col justify-between p-4 space-y-4 text-white bg-neutral-800"
      >
        <header className="flex justify-end">
          <button onClick={props.close}>
            <Icon
              icon={CloseIcon}
              className="w-10 h-10 p-2 transition rounded-full hover:bg-neutral-700"
            />
            <span className="sr-only">Close</span>
          </button>
        </header>
        <div className="relative flex-1 p-4 overflow-hidden">
          {props.children}
        </div>
        <footer>{props.caption}</footer>
      </DialogContent>
    </DialogOverlay>
  )
}
