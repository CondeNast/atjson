const path = require('path');

module.exports = function(context) {
  const contentPath = path.join(path.resolve(context.siteDir), 'docs');

  return {
    name: 'docusaurus-typescript-loader',

    getPathsToWatch() {
      return [contentPath];
    },

    configureWebpack() {
      return {
        module: {
          rules: [
            {
              test: /(\.tsx?)$/,
              include: [contentPath],
              exclude: /node_modules/,
              use: [
                {
                  loader: 'ts-loader',
                  options: {
                    configFile: path.join(path.resolve(context.siteDir), 'tsconfig.json')
                  }
                }
              ]
            }
          ]
        }
      };
    },
  };
};
