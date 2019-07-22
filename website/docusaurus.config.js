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
        {to: 'docs/getting-started', label: 'Docs', position: 'left'},
        {
          href: 'https://github.com/CondeNast/atjson',
          label: 'GitHub',
          position: 'right'
        }
      ]
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Docs',
          items: [
            {
              label: 'Docs',
              to: 'docs/getting-started'
            },
            {
              label: 'API Documentation',
              to: 'docs/api'
            }
          ]
        }
      ],
      logo: {
        alt: 'Condé Nast',
        src: '/img/conde-nast.svg'
      },
      copyright: `Copyright © ${new Date().getFullYear()} Condé Nast`
    }
  },
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
