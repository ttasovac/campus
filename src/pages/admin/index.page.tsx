import dynamic from 'next/dynamic'
import { Fragment } from 'react'
import { config } from '@/cms/cms.config'

/**
 * Netlify CMS only runs client-side and does not correctly pre-render on the server.
 */
const NetlifyCms = dynamic(
  async () => {
    /**
     * We cannot use `netlify-cms-app/dist/esm` because Next.js does not allow
     * importing css in node modules.
     *
     * TODO: Add custom webpack config to override this in `next.config.js`.
     */
    const { default: Cms } = await import('netlify-cms-app')
    const { nanoid } = await import('nanoid')

    Cms.init({ config })

    /** Generate UUIDs for resources. */
    Cms.registerEventListener(
      {
        name: 'preSave',
        handler({ entry }) {
          const data = entry.get('data')
          if (entry.get('collection') !== 'posts') {
            return data
          }
          if (!data.get('uuid')) {
            return data.set('uuid', nanoid())
          }
          return data
        },
      },
      {},
    )

    // TODO:
    // Cms.registerPreviewTemplate()

    return () => null
  },
  {
    loading({ error, isLoading, pastDelay, retry, timedOut }) {
      return (
        <p className="grid min-h-screen place-items-center">
          Loading CMS&hellip;
        </p>
      )
    },
    ssr: false,
  },
)

/**
 * Admin page, loads Netlify CMS client-side.
 */
export default function AdminPage(): JSX.Element {
  return (
    <Fragment>
      <div id="nc-root" />
      <NetlifyCms />
    </Fragment>
  )
}

AdminPage.Layout = Fragment
