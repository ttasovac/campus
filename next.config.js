/**
 * @typedef {import('@/i18n/i18n.config').Locale} Locale
 * @typedef {import('next/dist/next-server/server/config-shared').NextConfig & {i18n?: {locales: Array<Locale>; defaultLocale: Locale}}} Config
 */

/** @type {Config} */
const config = {
  experimental: {
    eslint: true,
    turboMode: true,
  },
  future: {
    webpack5: true,
  },
  i18n: {
    locales: ['en'],
    defaultLocale: 'en',
  },
  pageExtensions: ['page.tsx', 'api.ts'],
  async rewrites() {
    return [{ source: '/author/:id/1', destination: '/author/:id' }]
  },
}

/** @type {Array<(config: Config) => Config>} */
const plugins = [
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

module.exports = plugins.reduce((config, plugin) => plugin(config), config)
