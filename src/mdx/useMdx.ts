import { useState } from 'react'

import type { Mdx } from '@/mdx/runMdxSync'
import { runMdxSync } from '@/mdx/runMdxSync'

/**
 * Hydrates pre-compiled mdx.
 */
export function useMdx(code: string): Mdx {
  const [{ MdxContent, metadata }] = useState(() => {
    return runMdxSync(code)
  })

  return { MdxContent, metadata }
}
