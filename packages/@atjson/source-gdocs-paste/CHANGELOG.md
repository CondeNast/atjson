# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [0.12.0](https://github.com/CondeNast-Copilot/atjson/compare/@atjson/source-gdocs-paste@0.11.0...@atjson/source-gdocs-paste@0.12.0) (2018-11-29)


### ✨ New Features

* ✨📡 dynamically convert between types of sources ([#88](https://github.com/CondeNast-Copilot/atjson/issues/88))



## [0.11.0](https://github.com/CondeNast-Copilot/atjson/compare/@atjson/source-gdocs-paste@0.9.0...@atjson/source-gdocs-paste@0.11.0) (2018-10-22)


### ✨ New Features

* ✨👑✨ Make Annotations classes instead of JS objects ([#57](https://github.com/CondeNast-Copilot/atjson/issues/57))


### 🚨 Breaking Changes

* This introduces a bunch of breaking changes to AtJSON. The major change is that Annotations are now described as classes instead of a loose schema.

A summary of changes are the following:

⚠️ `@atjson/schema` is now deprecated. Instead of using the schema, instead use `@atjson/offset-annotations`, which provides a library of annotations that closely resemble those provided by  `@atjson/schema`

🃏 Schemas are now defined on a document subclass. The schema is a list of annotation classes that are used to identify annotations in the document.

🛸 Any annotations not found in the schema are identified as `unknown` annotations. These annotations are available to be read and updated like any other annotation, but may have incorrect transform behavior because the text transform behavior  is undefined. The default behavior should be acceptable for most cases.

🕵🏾‍♀️ `id`s are required property on Annotations. This is used to identify annotations for speedy updating for Offset

🖍 Annotations are now prefixed at rest. For the CommonMark Link annotation, it will be stored as `-commonmark-link` as the `type` and the attributes will be prefixed with `-commonmark` as well, meaning that instead of seeing `href` in the `attributes`, you will see `-commonmark-href`. When the annotation JSON is hydrated into an annotation class, prefixes are automatically removed. This prevents any collisions that may (and will) happen when converting between document types.

🎨 Renderers now take `Annotation`s instead of the `attributes`.  When additional context is required to render an annotation, a `context` object is passed as the second argument, which provides references to the `parent`, `next`, `previous`, and `children` annotations to the current annotation.


## [0.9.0](https://github.com/CondeNast-Copilot/atjson/compare/@atjson/source-gdocs-paste@0.8.11...@atjson/source-gdocs-paste@0.9.0) (2018-10-10)


### ✨ New Features

* ✨🤠 Typed Annotation Collections / Joins! ([#85](https://github.com/CondeNast-Copilot/atjson/issues/85))



## [0.8.11](https://github.com/CondeNast-Copilot/atjson/compare/@atjson/source-gdocs-paste@0.8.10...@atjson/source-gdocs-paste@0.8.11) (2018-09-14)

**Note:** Version bump only for package @atjson/source-gdocs-paste





# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [0.8.10](https://github.com/CondeNast-Copilot/atjson/compare/@atjson/source-gdocs-paste@0.8.9...@atjson/source-gdocs-paste@0.8.10) (2018-09-07)

## [0.8.9](https://github.com/CondeNast-Copilot/atjson/compare/@atjson/source-gdocs-paste@0.8.8...@atjson/source-gdocs-paste@0.8.9) (2018-09-04)


### 🐛 Fixes

* 🐛🔒 fix vulnerability with with git-dummy-commit by using shelljs directly ([#76](https://github.com/CondeNast-Copilot/atjson/issues/76))

## 0.8.8 (2018-08-02)

## 0.8.4 (2018-07-25)

## 0.7.16 (2018-04-27)

**Note:** Version bump only for package @atjson/source-gdocs-paste
