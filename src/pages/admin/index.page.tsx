import dynamic from 'next/dynamic'
import { Fragment } from 'react'
import { config } from '@/cms/cms.config'

/**
 * Netlify CMS only runs client-side and does not correctly pre-render on the server.
 */
const NetlifyCms = dynamic(
  async () => {
    // TODO: const Cms: CMS = await import('netlify-cms-app/dist/esm').then((mod) => mod.default)
    const Cms = await import('netlify-cms-app').then((mod) => mod.default)

    Cms.init({ config })

    /** Generate UUIDs for resources. */
    Cms.registerEventListener(
      {
        name: 'preSave',
        handler({ entry }) {
          // TODO:
          return entry
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
        <p className="grid place-items-center min-h-screen">
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
  // TODO:
  // return (
  //   <div id="nc-root">
  //     <NetlifyCms />
  //   </div>
  // )

  return <NetlifyCms />
}

AdminPage.Layout = Fragment
