module.exports = {
  title: "atjson",
  tagline: "rich text tooling",
  url: "https://atjson.condenast.io",
  baseUrl: "/",
  favicon: "img/favicon.ico",
  themeConfig: {
    navbar: {
      title: "atjson",
      items: [
        {
          to: "docs/getting-started",
          label: "Docs",
          position: "right",
        },
        {
          href: "https://github.com/CondeNast/atjson",
          label: "GitHub",
          position: "right",
        },
      ],
    },
    footer: {
      logo: {
        alt: "Condé Nast",
        src: "/img/conde-nast.svg",
        srcDark: "/img/conde-nast-dark.svg",
        href: "https://technology.condenast.com",
      },
      copyright: `Copyright © ${new Date().getFullYear()} Condé Nast`,
    },
  },
  presets: [
    [
      "@docusaurus/preset-classic",
      {
        theme: {
          customCss: require.resolve("./src/css/custom.css"),
        },
        docs: {
          sidebarPath: require.resolve("./sidebars.json"),
          editUrl: "https://github.com/CondeNast/atjson/edit/latest/website/",
        },
      },
    ],
  ],
};
