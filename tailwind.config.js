/** @ts-expect-error Missing module declaration. */
const colors = require('tailwindcss/colors')

const config = {
  mode: 'jit',
  purge: ['src/**/*.@(ts|tsx)'],
  darkMode: false,
  theme: {
    extend: {
      boxShadow: {
        'card-sm': 'rgba(0, 0, 0, 0.08) 0px 2px 8px 0px',
        'card-md': 'rgba(0, 0, 0, 0.08) 0px 5px 15px 0px',
        'card-lg': 'rgba(0, 0, 0, 0.12) 0px 10px 35px 0px',
      },
      colors: {
        neutral: {
          ...colors.trueGray,
          150: '#ebecee',
        },
        primary: {
          600: '#006699',
          700: '#005580',
        },
        secondary: {
          800: '#2c3547',
        },
      },
      fontFamily: {
        sans: '"Roboto", system-ui, sans-serif',
      },
      fontSize: {
        '4.5xl': [px(40), { lineHeight: 1 }],
      },
      gridTemplateColumns: {
        content: '1fr 80ch 1fr',
      },
      gridTemplateRows: {
        page: 'auto 1fr auto',
      },
      maxWidth: {
        '80ch': '80ch',
      },
      ringOffsetWidth: {
        DEFAULT: '2px',
      },
      typography(/** @type {(key: string) => string)} */ theme) {
        return {
          DEFAULT: {
            css: {
              /** Don't add quotes around `blockquote`. */
              'blockquote p:first-of-type::before': null,
              'blockquote p:last-of-type::after': null,
              a: {
                '&:focus': {
                  outline: 'none',
                },
                '&:focus-visible': {
                  borderRadius: theme('borderRadius.DEFAULT'),
                  color: theme('colors.primary.600'),
                  boxShadow: `white 0px 0px 0px 2px, ${theme(
                    'colors.primary.600',
                  )} 0px 0px 0px 5px`,
                },
              },
            },
          },
        }
      },
    },
  },
  variants: {
    extend: {
      backgroundColor: ['focus-visible'],
      ringColor: ['focus-visible'],
      ringOffsetColor: ['focus-visible'],
      ringOffsetWidth: ['focus-visible'],
      ringWidth: ['focus-visible'],
      textColor: ['focus-visible'],
    },
  },
  plugins: [
    /** @ts-expect-error Missing module declaration. */
    require('@tailwindcss/typography'),
    /** @ts-expect-error Missing module declaration. */
    require('@tailwindcss/aspect-ratio'),
  ],
}

/** @type {(px: number) => string} */
function px(pixel) {
  return `${pixel / 16}rem`
}

module.exports = config
