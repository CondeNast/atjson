#!/usr/bin/env node

const { execSync } = require('child_process');

const port = process.env.NODE_PORT || '8081';

console.log('Listening on ', port);

process.chdir("./packages/@atjson/offset-inspector/");
execSync(`./node_modules/.bin/parcel serve --port ${port} public/index.html`);
