/**
 * @typedef {import('@/i18n/i18n.config').Locale} Locale
 * @typedef {import('next/dist/next-server/server/config-shared').NextConfig & {i18n?: {locales: Array<Locale>; defaultLocale: Locale}}} Config
 */

/** @type {Config} */
const config = {
  experimental: {
    enableBlurryPlaceholder: true,
    eslint: true,
    turboMode: true,
  },
  future: {
    strictPostcssConfiguration: true,
    webpack5: true,
  },
  i18n: {
    locales: ['en'],
    defaultLocale: 'en',
  },
  pageExtensions: ['page.tsx', 'api.ts'],
  poweredByHeader: false,
  async headers() {
    return [
      /** Disallow crawlers indexing the site. */
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Robots-Tag',
            value: 'noindex, nofollow',
          },
        ],
      },
    ]
  },
  async rewrites() {
    return [
      { source: '/resources/:id/1', destination: '/resources/:id' },
      { source: '/author/:id/1', destination: '/author/:id' },
      { source: '/source/:id/1', destination: '/source/:id' },
      { source: '/tag/:id/1', destination: '/tag/:id' },
    ]
  },
}

/** @type {Array<(config: Config) => Config>} */
const plugins = [
  /** @ts-expect-error Missing module declaration. */
  require('@stefanprobst/next-svg')({
    svgo: {
      plugins: [
        { prefixIds: true },
        { removeDimensions: true },
        { removeViewBox: false },
      ],
    },
    svgr: {
      titleProp: true,
    },
  }),
  /** @ts-expect-error Missing module declaration. */
  require('@next/bundle-analyzer')({ enabled: process.env.ANALYZE === 'true' }),
  require('next-transpile-modules')([
    'xdm',
    'unist-util-position-from-estree',
    'estree-util-build-jsx',
    'estree-util-is-identifier-name',
    'periscopic',
    'hast-util-to-estree',
    'comma-separated-tokens',
    'estree-util-attach-comments',
    'hast-util-whitespace',
    'property-information',
    'space-separated-tokens',
    'unist-util-position',
    'zwitch',
  ]),
]

module.exports = plugins.reduce((config, plugin) => {
  return plugin(config)
}, config)
