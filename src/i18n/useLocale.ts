import { useRouter } from 'next/router'
import { useMemo } from 'react'
import type { LocaleConfig } from '@/i18n/getLocale'
import { getLocale } from '@/i18n/getLocale'

/**
 * Returns current i18n config.
 */
export function useLocale(): LocaleConfig {
  const router = useRouter()

  return useMemo(() => {
    return {
      ...getLocale(router),
    }
  }, [router])
}
