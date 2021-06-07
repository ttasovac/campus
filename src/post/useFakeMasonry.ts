import { useState, useEffect, useMemo } from 'react'

import { useDebouncedState } from '@/common/useDebouncedState'

/**
 * Sorts items into columns (which should be rendered into css columns or css grid with auto-flow column).
 */
export function useFakeMasonry<T>(items: Array<T>): Array<Array<T>> | null {
  const [columnCount, setColumnCount] = useState<number | null>(null)
  const debouncedColumnCount = useDebouncedState(columnCount, 150)

  useEffect(() => {
    function onWindowResize() {
      if (window.innerWidth >= 1280) {
        setColumnCount(3)
      } else if (window.innerWidth >= 768) {
        setColumnCount(2)
      } else {
        setColumnCount(1)
      }
    }

    window.addEventListener('resize', onWindowResize, { passive: true })

    onWindowResize()

    return () => {
      window.removeEventListener('resize', onWindowResize)
    }
  }, [])

  return useMemo(() => {
    if (debouncedColumnCount === null) return null

    const columns = Array(debouncedColumnCount).fill([])

    items.forEach((item, index) => {
      const column = index % debouncedColumnCount
      columns[column] = columns[column].concat(item)
    })

    return columns
  }, [debouncedColumnCount, items])
}
