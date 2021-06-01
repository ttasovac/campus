import { useState } from 'react'

export interface DialogState {
  isOpen: boolean
  open: () => void
  close: () => void
  toggle: () => void
}

/**
 * Manages dialog state.
 */
export function useDialogState(): DialogState {
  const [isOpen, setIsOpen] = useState(false)

  function open() {
    setIsOpen(true)
  }
  function close() {
    setIsOpen(false)
  }
  function toggle() {
    setIsOpen((isOpen) => !isOpen)
  }

  return {
    isOpen,
    open,
    close,
    toggle,
  }
}
