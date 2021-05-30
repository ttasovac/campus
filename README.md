# TODO

- imprint
- cookie consent?
- hypothesis plugin
- events!!!
- curricula!!!

- dont use @primer/octicons-react

- create algolia index in prebuild script
- create sitemap.xml and robots.txt in prebuild script
- rss feed
- storybook
- tests
- metadata - cf. https://github.com/stefanprobst/tmp/blob/main/config/metadata.config.ts

- when Next.js StaticImage is official, consider moving resource images from public folder back to content/resources/:id folder

- github api route should check `state` param

- try to use cms config to autogenerate some stuff in api/cms

- markdown footnote numbering

- eslint-plugin-jsx-a11y

## update

- major update for vfile / all of the unified/xdm ecosystem
- add this to package.json#eslintConfig.overrides when eslint-plugin-mdx has been updated to remark@13 / mdx@2

      {
        "files": [
          "**/*.@(md|mdx)"
        ],
        "extends": "plugin:mdx/recommended",
        "settings": {
          "mdx/code-blocks": false
        }
      }

and to lint-staged for md|mdx: "eslint --cache --fix",
