const appName = require("./package").name;
const express = require("express");
const app = express();

const basePath = "/packages/@atjson/offset-inspector/dist";

app.use(
  express.static(__dirname + basePath, {
    index: false
  })
);

// /ping for a healthy app!
app.get("/ping", (req, res) => res.send(200));

let index = require("fs")
  .readFileSync(__dirname + basePath + "/index.html")
  .toString();
//let environment = require('./config/environment')(process.env['NODE_ENV'] || 'development');

// Dynamic configuration is stored in a meta tag named "${package.name}/config"
/*let metaTag = new RegExp(`name="${appName}/config/environment" content="(.*)"`);
if (index.match(metaTag) == null) {
  console.warn('');
}

index = index.replace(metaTag, function (match) {
  return `name="${appName}/config/environment" content="${encodeURIComponent(JSON.stringify(environment))}"`;
});
*/

// Return the index.html with appropriate configuration variables
app.get("*", function(req, res) {
  res.send(index);
});

if (process.env["NODE_PORT"]) {
  let port = process.env["NODE_PORT"];
  app.listen(port, function() {
    console.log(`${appName} listening on port ${port}`);
  });
}

module.exports = app;
