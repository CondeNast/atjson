const path = require("path");
const readFileSync = require("fs").readFileSync;

module.exports = function(context) {
  const contentPath = path.join(path.resolve(context.siteDir), "src");
  const package = JSON.parse(
    readFileSync(path.join(path.resolve(context.siteDir), "package.json"))
  );

  const browserslist = package.browserslist.production
    ? package.browserslist.production
    : package.browserslist;

  return {
    name: "docusaurus-typescript-loader",

    getPathsToWatch() {
      return [contentPath];
    },

    configureWebpack(_config, isServer, { getBabelLoader, getCacheLoader }) {
      let config = {
        module: {
          rules: [
            {
              test: /\.jsx?$/,
              use: [
                getCacheLoader(isServer),
                getBabelLoader(isServer, {
                  presets: [
                    [
                      "@babel/env",
                      {
                        targets: browserslist
                      }
                    ],
                    "@babel/react"
                  ]
                })
              ]
            },
            {
              test: /\.tsx?$/,
              exclude: /node_modules/,
              include: [contentPath],
              use: [
                getCacheLoader(isServer),
                getBabelLoader(isServer, {
                  presets: [
                    [
                      "@babel/preset-typescript",
                      {
                        isTSX: true,
                        allExtensions: true
                      }
                    ],
                    "@babel/preset-react"
                  ],
                  plugins: [
                    "@babel/plugin-proposal-class-properties",
                    "@babel/plugin-proposal-object-rest-spread"
                  ]
                })
              ]
            }
          ]
        }
      };
      console.log(JSON.stringify(config, null, 2));
      return config;
    }
  };
};
