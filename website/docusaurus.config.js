const { join } = require("path");

module.exports = {
  title: "atjson",
  tagline: "TK",
  url: "https://atjson.condenast.io",
  baseUrl: "/",
  favicon: "img/favicon.ico",
  themeConfig: {
    navbar: {
      title: "atjson",
      links: [
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
        href: "https://technology.condenast.com",
      },
      copyright: `Copyright © ${new Date().getFullYear()} Condé Nast`,
    },
  },
  plugins: [join(__dirname, "plugins", "docusaurus-typescript-loader")],
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
