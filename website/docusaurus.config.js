const { join } = require('path');

module.exports = {
  title: 'atjson',
  tagline: 'Content that you can query, manipulate, and store with ease',
  url: 'https://your-docusaurus-test-site.com',
  baseUrl: '/',
  favicon: 'img/favicon.ico',
  themeConfig: {
    navbar: {
      title: 'atjson',
      logo: {
        alt: 'My site Logo',
        src: 'img/logo.svg'
      },
      links: [
        {
          to: 'docs/getting-started',
          label: 'Docs',
          position: 'right'
        },
        {
          href: 'https://github.com/CondeNast/atjson',
          label: 'GitHub',
          position: 'right'
        }
      ]
    },
    footer: {
      style: 'dark',
      logo: {
        alt: 'Condé Nast',
        src: '/img/conde-nast.svg'
      },
      copyright: `Copyright © ${new Date().getFullYear()} Condé Nast`
    }
  },
  plugins: [
    join(__dirname, 'plugins', 'docusaurus-typescript-loader'),
  ],
  presets: [
    [
      '@docusaurus/preset-classic',
      {
        docs: {
          sidebarPath: require.resolve('./sidebars.json')
        }
      },
    ],
  ],
};
