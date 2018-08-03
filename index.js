#!/usr/bin/env node

const { execSync } = require('child_process');

//process.chdir("./packages/@atjson/offset-inspector/");
execSync("./node_modules/.bin/parcel public/index.html", {
  cwd: './packages/@atjson/offset-inspector/'
});
