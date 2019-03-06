module.exports = {
  "src": [
    "./packages/@atjson/document/src",
    "./packages/@atjson/hir/src",
    "./packages/@atjson/offset-annotations/src",
    "./packages/@atjson/offset-core-components/src",
    "./packages/@atjson/renderer-commonmark/src",
    "./packages/@atjson/renderer-graphviz/src",
    "./packages/@atjson/renderer-hir/src",
    "./packages/@atjson/renderer-plain-text/src",
    "./packages/@atjson/renderer-react/src",
    "./packages/@atjson/renderer-webcomponent/src",
    "./packages/@atjson/source-commonmark/src",
    "./packages/@atjson/source-gdocs-paste/src",
    "./packages/@atjson/source-html/src",
    "./packages/@atjson/source-prism/src",
    "./packages/@atjson/source-mobiledoc/src",
    "./packages/@atjson/source-url/src"
  ],
  "out": "docs",
  "mode": "modules",
  "name": "@atjson",
  "tsconfig": "./tsconfig.json",
  "external-modulemap": ".*packages\/(@atjson\/[^\/]+)\/.*",
  "readme": "./README.md"
};
