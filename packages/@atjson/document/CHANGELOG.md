# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [0.22.1](https://github.com/CondeNast-Copilot/atjson/compare/@atjson/document@0.22.0...@atjson/document@0.22.1) (2019-10-08)

### 🐛 Fixes

- 🐞 clone annotations on conversion document ([#237](https://github.com/CondeNast-Copilot/atjson/issues/237))

## [0.22.0](https://github.com/CondeNast-Copilot/atjson/compare/@atjson/document@0.21.1...@atjson/document@0.22.0) (2019-10-04)

### ✨ New Features

- ✨ add cut method to document class ([#225](https://github.com/CondeNast-Copilot/atjson/issues/225))

## [0.21.1](https://github.com/CondeNast/atjson/compare/@atjson/document@0.21.0...@atjson/document@0.21.1) (2019-09-20)

### 🐛 Fixes

- 🐞 `clone` and `toJSON` coerced `undefined` values into `null`

## [0.21.0](https://github.com/CondeNast/atjson/compare/@atjson/document@0.20.0...@atjson/document@0.21.0) (2019-09-12)

**Note:** Version bump only for package @atjson/document

## [0.20.0](https://github.com/CondeNast-Copilot/atjson/compare/@atjson/document@0.19.0...@atjson/document@0.20.0) (2019-08-26)

### ✨ New Features

- ✨ Add equal() and canonical() on the document class

## [0.19.0](https://github.com/CondeNast-Copilot/atjson/compare/@atjson/document@0.17.0...@atjson/document@0.19.0) (2019-08-05)

**Note:** Version bump only for package @atjson/document

## [0.17.0](https://github.com/CondeNast-Copilot/atjson/compare/@atjson/document@0.15.0...@atjson/document@0.17.0) (2019-07-10)

### ✨ New Features

- ✨ Reduce magic in converting documents. ([#132](https://github.com/CondeNast-Copilot/atjson/issues/132))

### 🐛 Fixes

- 🐞 Fix references to wrong github repository ([#135](https://github.com/CondeNast-Copilot/atjson/issues/135))

### 🚨 Breaking Changes

- When converting a document, it will no longer coerce a document. You will need to do this yourself!
- You can no longer nest converters inside of another converter. Instead import `getConverterFor` from @atjson/document and use the function supplied from that.

These improvements are designed to improve the developer experience of atjson for developers. We've encountered some frustrations where:

1. Conversions wouldn't run because there are two different versions of @atjson/document installed.

   📝 If you are using atjson, update your dependencies to this version. Any version increment after this shouldn't break your converters.

2. Converters would get called, but the document was made up of only UnknownAnnotations.

   👩🏽‍🏫 You're no longer allowed to nest converters. This change was done to make converting less confusing, because it was super weird to have all your annotations be "Unknown" if you ran a converter before running the rest of your conversion code. Also, it will no longer clone the document, so this should hopefully make some conversions speedier! 🐰

3. It was unclear when convertTo would actually run any code.

   📣We've changed this so all converters are user-defined code. If there is no converter defined, it will let you know!

## [0.15.0](https://github.com/CondeNast/atjson/compare/@atjson/document@0.14.9...@atjson/document@0.15.0) (2019-04-19)

### ✨ New Features

- ✨🥃 add an interface for declaring annotation attributes ([#130](https://github.com/CondeNast/atjson/issues/130))

## [0.14.9](https://github.com/CondeNast/atjson/compare/@atjson/document@0.14.8...@atjson/document@0.14.9) (2019-04-15)

### 🐛 Fixes

- 🐛 fix slice so it includes annotations fully inside it as well as overlapping annotations

## [0.14.8](https://github.com/CondeNast/atjson/compare/@atjson/document@0.14.7...@atjson/document@0.14.8) (2019-04-15)

### 🐛 Fixes

- 🐝 fix slice so it only includes overlapping annotations from the parent document and the correct underlying text ([#125](https://github.com/CondeNast/atjson/issues/125))

## [0.14.7](https://github.com/CondeNast/atjson/compare/@atjson/document@0.14.6...@atjson/document@0.14.7) (2019-03-21)

### 🐛 Fixes

- 🐝 Fix unknown annotations passing attributes by reference and HIR optimization bug ([#122](https://github.com/CondeNast/atjson/issues/122))

## [0.14.6](https://github.com/CondeNast/atjson/compare/@atjson/document@0.14.5...@atjson/document@0.14.6) (2019-03-19)

**Note:** Version bump only for package @atjson/document

## [0.14.5](https://github.com/CondeNast/atjson/compare/@atjson/document@0.14.4...@atjson/document@0.14.5) (2019-03-18)

### 🐛 Fixes

- 🐛 reify unknown annotations when passing them into `createAnnotation` ([#120](https://github.com/CondeNast/atjson/issues/120))

## [0.14.4](https://github.com/CondeNast/atjson/compare/@atjson/document@0.14.3...@atjson/document@0.14.4) (2019-03-18)

### 🐛 Fixes

- 🚀🐛 Performance fixes ([#119](https://github.com/CondeNast/atjson/issues/119))

## [0.14.3](https://github.com/CondeNast/atjson/compare/@atjson/document@0.14.2...@atjson/document@0.14.3) (2019-03-14)

### 🐛 Fixes

- 🐝🚀 Fix performance regressions ([#118](https://github.com/CondeNast/atjson/issues/118))

## [0.14.2](https://github.com/CondeNast/atjson/compare/@atjson/document@0.14.1...@atjson/document@0.14.2) (2019-02-12)

### 🐛 Fixes

- 🐝 Allow annotation classes in document constructor ([#106](https://github.com/CondeNast/atjson/issues/106))

## [0.14.1](https://github.com/CondeNast/atjson/compare/@atjson/document@0.14.0...@atjson/document@0.14.1) (2019-01-14)

### 🐛 Fixes

- 🐞 fix parse annotation / unknown annotation nesting order

## [0.14.0](https://github.com/CondeNast/atjson/compare/@atjson/document@0.13.5...@atjson/document@0.14.0) (2019-01-09)

### ✨ New Features

- ✨ Use combined schema doc class in doc.convertTo

### 🐛 Fixes

- 🐜 Allow different vendor prefixes in attributes

## [0.13.5](https://github.com/CondeNast/atjson/compare/@atjson/document@0.13.4...@atjson/document@0.13.5) (2019-01-07)

### ✨ New Features

- ✨ Add query methods `document.match`, `namedCollection.outerJoin`, `namedCollection.forEach`, `namedCollection.reduce`, `join.outerJoin`, `join.where`, `join.forEach`

## [0.13.4](https://github.com/CondeNast/atjson/compare/@atjson/document@0.13.3...@atjson/document@0.13.4) (2018-12-11)

### 🐛 Fixes

- 🐛 fix tsc errors causing lerna to fail to build

## [0.13.3](https://github.com/CondeNast/atjson/compare/@atjson/document@0.13.2...@atjson/document@0.13.3) (2018-12-11)

**Note:** Version bump only for package @atjson/document

## [0.13.2](https://github.com/CondeNast/atjson/compare/@atjson/document@0.13.1...@atjson/document@0.13.2) (2018-12-11)

**Note:** Version bump only for package @atjson/document

## [0.13.1](https://github.com/CondeNast/atjson/compare/@atjson/document@0.13.0...@atjson/document@0.13.1) (2018-12-11)

**Note:** Version bump only for package @atjson/document

## [0.13.0](https://github.com/CondeNast/atjson/compare/@atjson/document@0.12.0...@atjson/document@0.13.0) (2018-12-11)

### ✨ New Features

- ✨ Coerce or convert to sources ([#93](https://github.com/CondeNast/atjson/issues/93))

## [0.12.0](https://github.com/CondeNast/atjson/compare/@atjson/document@0.11.0...@atjson/document@0.12.0) (2018-11-29)

### ✨ New Features

- ✨🔮 allow Annotation classes or AnnotationJSON to all Document methods ([#90](https://github.com/CondeNast/atjson/issues/90))
- ✨📡 dynamically convert between types of sources ([#88](https://github.com/CondeNast/atjson/issues/88))

## [0.11.0](https://github.com/CondeNast/atjson/compare/@atjson/document@0.9.0...@atjson/document@0.11.0) (2018-10-22)

### ✨ New Features

- ✨👑✨ Make Annotations classes instead of JS objects ([#57](https://github.com/CondeNast/atjson/issues/57))

### 🚨 Breaking Changes

- This introduces a bunch of breaking changes to AtJSON. The major change is that Annotations are now described as classes instead of a loose schema.

A summary of changes are the following:

⚠️ `@atjson/schema` is now deprecated. Instead of using the schema, instead use `@atjson/offset-annotations`, which provides a library of annotations that closely resemble those provided by `@atjson/schema`

🃏 Schemas are now defined on a document subclass. The schema is a list of annotation classes that are used to identify annotations in the document.

🛸 Any annotations not found in the schema are identified as `unknown` annotations. These annotations are available to be read and updated like any other annotation, but may have incorrect transform behavior because the text transform behavior is undefined. The default behavior should be acceptable for most cases.

🕵🏾‍♀️ `id`s are required property on Annotations. This is used to identify annotations for speedy updating for Offset

🖍 Annotations are now prefixed at rest. For the CommonMark Link annotation, it will be stored as `-commonmark-link` as the `type` and the attributes will be prefixed with `-commonmark` as well, meaning that instead of seeing `href` in the `attributes`, you will see `-commonmark-href`. When the annotation JSON is hydrated into an annotation class, prefixes are automatically removed. This prevents any collisions that may (and will) happen when converting between document types.

## [0.9.0](https://github.com/CondeNast/atjson/compare/@atjson/document@0.8.7...@atjson/document@0.9.0) (2018-10-10)

### ✨ New Features

- ✨🤠 Typed Annotation Collections / Joins! ([#85](https://github.com/CondeNast/atjson/issues/85))

## [0.8.7](https://github.com/CondeNast/atjson/compare/@atjson/document@0.8.6...@atjson/document@0.8.7) (2018-09-14)

**Note:** Version bump only for package @atjson/document

## [0.8.6](https://github.com/CondeNast/atjson/compare/@atjson/document@0.8.5...@atjson/document@0.8.6) (2018-09-07)

### ✨ New Features

- ✨ Added nested query syntax which allows for querying and altering collections of annotations.

## 0.8.5 (2018-09-04)

**Note:** Version bump only for package @atjson/document

## 0.8.4 (2018-07-25)

**Note:** Version bump only for package @atjson/document

## 0.7.16 (2018-04-27)

**Note:** Version bump only for package @atjson/document
