import generate from '@stefanprobst/next-sitemap'

import { log } from '@/utils/log'
import { url as siteUrl } from '~/config/site.config'

generate({ baseUrl: siteUrl, shouldFormat: true, robots: true })
  .then(() => log.success('Successfully generated sitemap.'))
  .catch(log.error)
