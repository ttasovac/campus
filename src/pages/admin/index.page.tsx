import dynamic from 'next/dynamic'
import { Fragment } from 'react'
import { config } from '@/cms/cms.config'
import { ResourceCollectionPreview } from '@/cms/previews/ResourceCollectionPreview'
import { ResourcePreview } from '@/cms/previews/ResourcePreview'

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

    /** Register preview templates. */
    Cms.registerPreviewTemplate('resources', ResourcePreview)
    Cms.registerPreviewTemplate(
      'resourceCollections',
      ResourceCollectionPreview,
    )

    return () => null
  },
  {
    loading: function Loading(props) {
      const { error, pastDelay, retry, timedOut } = props

      const message =
        error != null ? (
          <div>
            Failed to load CMS! <button onClick={retry}>Retry</button>
          </div>
        ) : timedOut === true ? (
          <div>
            Taking a long time to load CMS&hellip;{' '}
            <button onClick={retry}>Retry</button>
          </div>
        ) : pastDelay === true ? (
          <div>Loading CMS&hellip;</div>
        ) : null

      return (
        <div className="grid min-h-screen place-items-center">{message}</div>
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
