/** @type {import('postcss-load-config').Config} */
const config = {
  plugins: {
    '@tailwindcss/postcss': {},
    'postcss-preset-env': {
      features: {
        'oklch-function': true,
      },
      preserve: true,
    },
    autoprefixer: {},
  },
};

export default config;
