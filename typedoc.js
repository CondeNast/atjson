module.exports = {
  "src": [
    "./packages/@atjson/document/src",
    "./packages/@atjson/hir/src",
    "./packages/@atjson/renderer-commonmark/src",
    "./packages/@atjson/renderer-hir/src",
    "./packages/@atjson/renderer-plain-text/src",
    "./packages/@atjson/renderer-react/src",
    "./packages/@atjson/schema/src",
    "./packages/@atjson/source-commonmark/src",
    "./packages/@atjson/source-gdocs-paste/src",
    "./packages/@atjson/source-html/src"
  ],
  "out": "docs",
  "mode": "modules",
  "name": "@atjson",
  "tsconfig": "./tsconfig.json",
  "external-modulemap": ".*packages\/(@atjson\/[^\/]+)\/.*",
  "readme": "./README.md"
};
