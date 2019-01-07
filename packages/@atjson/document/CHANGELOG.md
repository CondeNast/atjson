# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [0.13.5](https://github.com/CondeNast-Copilot/atjson/compare/@atjson/document@0.13.4...@atjson/document@0.13.5) (2019-01-07)

**Note:** Version bump only for package @atjson/document





## [0.13.4](https://github.com/CondeNast-Copilot/atjson/compare/@atjson/document@0.13.3...@atjson/document@0.13.4) (2018-12-11)


### 🐛 Fixes

* 🐛 fix tsc errors causing lerna to fail to build



## [0.13.3](https://github.com/CondeNast-Copilot/atjson/compare/@atjson/document@0.13.2...@atjson/document@0.13.3) (2018-12-11)

**Note:** Version bump only for package @atjson/document





## [0.13.2](https://github.com/CondeNast-Copilot/atjson/compare/@atjson/document@0.13.1...@atjson/document@0.13.2) (2018-12-11)

**Note:** Version bump only for package @atjson/document





## [0.13.1](https://github.com/CondeNast-Copilot/atjson/compare/@atjson/document@0.13.0...@atjson/document@0.13.1) (2018-12-11)

**Note:** Version bump only for package @atjson/document


## [0.13.0](https://github.com/CondeNast-Copilot/atjson/compare/@atjson/document@0.12.0...@atjson/document@0.13.0) (2018-12-11)


### ✨ New Features

* ✨ Coerce or convert to sources ([#93](https://github.com/CondeNast-Copilot/atjson/issues/93))


## [0.12.0](https://github.com/CondeNast-Copilot/atjson/compare/@atjson/document@0.11.0...@atjson/document@0.12.0) (2018-11-29)


### ✨ New Features

* ✨🔮 allow Annotation classes or AnnotationJSON to all Document methods ([#90](https://github.com/CondeNast-Copilot/atjson/issues/90))
* ✨📡 dynamically convert between types of sources ([#88](https://github.com/CondeNast-Copilot/atjson/issues/88))



## [0.11.0](https://github.com/CondeNast-Copilot/atjson/compare/@atjson/document@0.9.0...@atjson/document@0.11.0) (2018-10-22)


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


## [0.9.0](https://github.com/CondeNast-Copilot/atjson/compare/@atjson/document@0.8.7...@atjson/document@0.9.0) (2018-10-10)


### ✨ New Features

* ✨🤠 Typed Annotation Collections / Joins! ([#85](https://github.com/CondeNast-Copilot/atjson/issues/85))



## [0.8.7](https://github.com/CondeNast-Copilot/atjson/compare/@atjson/document@0.8.6...@atjson/document@0.8.7) (2018-09-14)

**Note:** Version bump only for package @atjson/document


## [0.8.6](https://github.com/CondeNast-Copilot/atjson/compare/@atjson/document@0.8.5...@atjson/document@0.8.6) (2018-09-07)

### ✨ New Features

* ✨ Added nested query syntax which allows for querying and altering collections of annotations.

## 0.8.5 (2018-09-04)

**Note:** Version bump only for package @atjson/document

## 0.8.4 (2018-07-25)

**Note:** Version bump only for package @atjson/document


## 0.7.16 (2018-04-27)

**Note:** Version bump only for package @atjson/document
