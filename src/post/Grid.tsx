import type { ReactNode } from 'react'

export interface GridProps {
  children: ReactNode
}

/**
 * Grid.
 */
export function Grid(props: GridProps): JSX.Element {
  return <div className="grid grid-cols-2 gap-4">{props.children}</div>
}
