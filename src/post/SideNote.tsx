import type { IconProps } from '@primer/octicons-react'
import {
  AlertIcon,
  InfoIcon,
  LightBulbIcon,
  PencilIcon,
  ZapIcon,
} from '@primer/octicons-react'
import cx from 'clsx'
import type { FC, ReactNode } from 'react'

import { Icon } from '@/common/Icon'
import { capitalize } from '@/utils/capitalize'

export type SideNoteType = 'danger' | 'info' | 'note' | 'tip' | 'warning'

export interface SideNoteProps {
  /**
   * SideNote type.
   *
   * @default "note"
   */
  type?: SideNoteType
  /**
   * Optional title. Defaults to value of `type`.
   */
  title?: string
  children: ReactNode
}

const styles: Record<SideNoteType, string> = {
  note: 'bg-neutral-50 border-neutral-600 text-neutral-800',
  info: 'bg-blue-50 border-blue-600 text-blue-800',
  tip: 'bg-green-50 border-green-600 text-green-800',
  warning: 'bg-yellow-50 border-yellow-500 text-yellow-800',
  danger: 'bg-red-50 border-red-600 text-red-800',
}

const icons: Record<SideNoteType, FC<IconProps>> = {
  note: PencilIcon,
  info: InfoIcon,
  tip: LightBulbIcon,
  warning: AlertIcon,
  danger: ZapIcon,
}

/**
 * SideNote.
 */
export function SideNote(props: SideNoteProps): JSX.Element {
  const type = props.type ?? 'note'
  const title = props.title ?? capitalize(type)

  return (
    <aside
      className={cx('border-l-4 px-6 py-6 space-y-3 rounded', styles[type])}
    >
      <strong className="flex items-center space-x-2 font-bold">
        <Icon icon={icons[type]} />
        <span>{title}</span>
      </strong>
      <div>{props.children}</div>
    </aside>
  )
}
