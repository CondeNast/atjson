# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [0.11.0](https://github.com/CondeNast-Copilot/atjson/compare/@atjson/renderer-hir@0.10.0...@atjson/renderer-hir@0.11.0) (2018-10-22)


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


## [0.10.0](https://github.com/CondeNast-Copilot/atjson/compare/@atjson/renderer-hir@0.9.3...@atjson/renderer-hir@0.10.0) (2018-10-10)


### ✨ New Features

* ✨🤠 Typed Annotation Collections / Joins! ([#85](https://github.com/CondeNast-Copilot/atjson/issues/85))



## [0.9.3](https://github.com/CondeNast-Copilot/atjson/compare/@atjson/renderer-hir@0.9.2...@atjson/renderer-hir@0.9.3) (2018-09-14)

**Note:** Version bump only for package @atjson/renderer-hir





# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [0.9.2](https://github.com/CondeNast-Copilot/atjson/compare/@atjson/renderer-hir@0.9.1...@atjson/renderer-hir@0.9.2) (2018-09-07)

## [0.9.1](https://github.com/CondeNast-Copilot/atjson/compare/@atjson/renderer-hir@0.9.0...@atjson/renderer-hir@0.9.1) (2018-09-04)

## 0.9.0 (2018-08-02)


### ✨ New Features

* ✨ allow a HIR to be passed to a renderer ([#73](https://github.com/CondeNast-Copilot/atjson/issues/73))

## 0.8.4 (2018-07-25)

## 0.8.0 (2018-05-14)

## 0.7.16 (2018-04-27)
