# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## 0.30.3 (2025-02-05)

### Bug Fixes

- type of Join.join arg to Annotation<any> ([12ea1d1](https://github.com/CondeNast/atjson/commit/12ea1d134128787259eea3838cce80a101d1c45c))

## 0.30.2 (2024-06-24)

### Bug Fixes

- use text annotations in serialization ([#1771](https://github.com/CondeNast/atjson/issues/1771)) ([a9dab92](https://github.com/CondeNast/atjson/commit/a9dab92c32f2a322d3c317502a3bb4cc8e333a40))

## 0.30.1 (2024-05-08)

### Bug Fixes

- add dataset annotation wrapped around object replacement character ([e3f0069](https://github.com/CondeNast/atjson/commit/e3f0069f3df77b86342838c192afd817e2f34de0))
- don't produce collapsed dataset annotations in converter ([e9fe5b1](https://github.com/CondeNast/atjson/commit/e9fe5b10d58a714b8430f384df5886bdfc4db396))
- lint ([38550a7](https://github.com/CondeNast/atjson/commit/38550a7f9d4f9c96ca2bc501d5865ff9dd65b685))

# 0.30.0 (2024-03-21)

### Bug Fixes

- address comments ([6a69702](https://github.com/CondeNast/atjson/commit/6a697021916e3544b2b0252ab787f054b15b0c68))
- address lint comments and test issues ([8a5d58e](https://github.com/CondeNast/atjson/commit/8a5d58ec391960d1d7cf300aba9605a531b670d9))
- converting tables and withStableIds support ([7280fcc](https://github.com/CondeNast/atjson/commit/7280fcc665becff6f9a46383dc00a3b555722d55))

### Features

- add TextAnnotation and export it ([a848b44](https://github.com/CondeNast/atjson/commit/a848b44230a37593d09f5f432e919f1fd89519aa))

### Reverts

- Revert "Gdocs tables (#1726)" (#1727) ([ef419b8](https://github.com/CondeNast/atjson/commit/ef419b8d06bb3b3f73ed817b1f66b7cf76098ef8)), closes [#1726](https://github.com/CondeNast/atjson/issues/1726) [#1727](https://github.com/CondeNast/atjson/issues/1727)

## [0.29.5](https://github.com/CondeNast/atjson/compare/@atjson/document@0.29.4...@atjson/document@0.29.5) (2023-10-16)

**Note:** Version bump only for package @atjson/document

## [0.29.4](https://github.com/CondeNast/atjson/compare/@atjson/document@0.29.3...@atjson/document@0.29.4) (2023-07-19)

**Note:** Version bump only for package @atjson/document

## 0.29.3 (2023-05-17)

### Bug Fixes

- add MARK_COLLAPSED token to document serialize ([#1652](https://github.com/CondeNast/atjson/issues/1652)) ([d269169](https://github.com/CondeNast/atjson/commit/d26916975a6a1c2a39ecaa77c875b3fa567c0bc9))

## 0.29.2 (2023-05-03)

### Bug Fixes

- sorting start/end tokens for zero-length marks ([#1648](https://github.com/CondeNast/atjson/issues/1648)) ([cd84fed](https://github.com/CondeNast/atjson/commit/cd84fedf44d7daa69023a43fa299554de0183c74))

## 0.29.1 (2023-04-10)

### Bug Fixes

- handle text blocks and mark nesting consistently ([13d1a5b](https://github.com/CondeNast/atjson/commit/13d1a5ba418acdb5458b59e41d1ab99ed407106d))

# [0.29.0](https://github.com/CondeNast/atjson/compare/@atjson/document@0.28.1...@atjson/document@0.29.0) (2023-02-28)

### Features

- add support for retained slices ([779c189](https://github.com/CondeNast/atjson/commit/779c189803e1a876ce56e05a436fc2e04df3f5b2))

## [0.28.1](https://github.com/CondeNast/atjson/compare/@atjson/document@0.28.0...@atjson/document@0.28.1) (2023-01-04)

### Bug Fixes

- edge case when using withStableIds in serializing ([ddfbccc](https://github.com/CondeNast/atjson/commit/ddfbccccb3e0c9ecbcaa2498c819c258d685e598))

# [0.28.0](https://github.com/CondeNast/atjson/compare/@atjson/document@0.27.1...@atjson/document@0.28.0) (2022-12-15)

### Features

- add option to throw on unknown annotations when serializing ([1f74dca](https://github.com/CondeNast/atjson/commit/1f74dcaf6e1f94548cbb282e1731a50935e47118))
- use @atjson/util in @atjson/renderer-hir ([1ffccf8](https://github.com/CondeNast/atjson/commit/1ffccf8cfb5b1d67ddca6e5b80504a2bd09e1cef))

## [0.27.1](https://github.com/CondeNast/atjson/compare/@atjson/document@0.27.0...@atjson/document@0.27.1) (2022-11-29)

### Bug Fixes

- handle jagged lists in serialization ([071a69e](https://github.com/CondeNast/atjson/commit/071a69e71fc8af6358575b9e344a13ca19d8547c))

# [0.27.0](https://github.com/CondeNast/atjson/compare/@atjson/document@0.26.1...@atjson/document@0.27.0) (2022-10-06)

### Features

- add code for deserializing entities ([a0b448c](https://github.com/CondeNast/atjson/commit/a0b448c0d883c232ce5f9a2dfcf8e9c30ddfeba5))
- add wip of storage format serialization ([2fa3f85](https://github.com/CondeNast/atjson/commit/2fa3f8584008ea336760c73b5314b43fed26ea37))
- optionally include ranges for blocks ([bed516b](https://github.com/CondeNast/atjson/commit/bed516b91c40275a47a0f0741f875101f4ddd5ba))
- split text into blocks to account for jagged boundaries ([7de84cf](https://github.com/CondeNast/atjson/commit/7de84cf083c0bceb753631c4dbaa54ad7b19444e))

## [0.26.1](https://github.com/CondeNast/atjson/compare/@atjson/document@0.26.0...@atjson/document@0.26.1) (2022-09-07)

**Note:** Version bump only for package @atjson/document

# [0.26.0](https://github.com/CondeNast/atjson/compare/@atjson/document@0.25.0...@atjson/document@0.26.0) (2022-08-17)

### Bug Fixes

- make ids stable when doing equality checks ([3d0f435](https://github.com/CondeNast/atjson/commit/3d0f4351ed6883da315dbdc2ff4ed4cfd3feb94b))

### Features

- make withStableIds public (for testing purposes) ([5ca405f](https://github.com/CondeNast/atjson/commit/5ca405fd1f3737b5b913dac370d32ce2f19c186e))

# [0.25.0](https://github.com/CondeNast/atjson/compare/@atjson/document@0.24.5...@atjson/document@0.25.0) (2022-08-16)

### Features

- add new core annotation type, slice ([7a3827a](https://github.com/CondeNast/atjson/commit/7a3827a9c9080943c4b3469e807a0013781ae9ae))

## [0.24.5](https://github.com/CondeNast/atjson/compare/@atjson/document@0.24.4...@atjson/document@0.24.5) (2022-01-24)

**Note:** Version bump only for package @atjson/document

## [0.24.4](https://github.com/CondeNast/atjson/compare/@atjson/document@0.24.3...@atjson/document@0.24.4) (2021-06-01)

**Note:** Version bump only for package @atjson/document

## [0.24.3](https://github.com/CondeNast/atjson/compare/@atjson/document@0.24.2...@atjson/document@0.24.3) (2020-09-22)

**Note:** Version bump only for package @atjson/document

## [0.24.2](https://github.com/CondeNast/atjson/compare/@atjson/document@0.24.1...@atjson/document@0.24.2) (2020-05-20)

### Bug Fixes

- pass slice filter override in conversion docs ([172b4d9](https://github.com/CondeNast/atjson/commit/172b4d9dd4cc4c9162375e0f7135f2e3c908feda))

## [0.24.1](https://github.com/CondeNast/atjson/compare/@atjson/document@0.24.0...@atjson/document@0.24.1) (2020-05-19)

**Note:** Version bump only for package @atjson/document

# [0.24.0](https://github.com/CondeNast/atjson/compare/@atjson/document@0.23.4...@atjson/document@0.24.0) (2020-04-16)

### Features

- use hierarchical sort as default sort ([ed8ee3d](https://github.com/CondeNast/atjson/commit/ed8ee3d1f41c4afd200fdfe5eb80c4f0fad175f6))

## [0.23.4](https://github.com/CondeNast/atjson/compare/@atjson/document@0.23.3...@atjson/document@0.23.4) (2020-04-15)

### Bug Fixes

- preserve original document sort in canonical ([fe75116](https://github.com/CondeNast/atjson/commit/fe751169647e02888a207eb08747e5576bea4cc1))

## [0.23.3](https://github.com/CondeNast/atjson/compare/@atjson/document@0.23.2...@atjson/document@0.23.3) (2020-03-25)

**Note:** Version bump only for package @atjson/document

## [0.23.3-dev.0](https://github.com/CondeNast/atjson/compare/@atjson/document@0.23.2...@atjson/document@0.23.3-dev.0) (2020-03-23)

**Note:** Version bump only for package @atjson/document

## [0.23.2](https://github.com/CondeNast/atjson/compare/@atjson/document@0.23.1...@atjson/document@0.23.2) (2020-03-11)

**Note:** Version bump only for package @atjson/document

## [0.23.1](https://github.com/CondeNast/atjson/compare/@atjson/document@0.23.0...@atjson/document@0.23.1) (2020-03-02)

**Note:** Version bump only for package @atjson/document

# [0.23.0](https://github.com/CondeNast/atjson/compare/@atjson/document@0.22.11...@atjson/document@0.23.0) (2020-02-20)

### Features

- add Annotation is type narrowing function ([#423](https://github.com/CondeNast/atjson/issues/423)) ([2858a4f](https://github.com/CondeNast/atjson/commit/2858a4f707dd14d0ece5d0bc576f38363dfbe5ba))

## [0.22.11](https://github.com/CondeNast-Copilot/atjson/compare/@atjson/document@0.22.10...@atjson/document@0.22.11) (2020-02-10)

**Note:** Version bump only for package @atjson/document

## [0.22.10](https://github.com/CondeNast/atjson/compare/@atjson/document@0.22.9...@atjson/document@0.22.10) (2020-01-24)

### 🐛 Fixes

- 🐞 Fixes bug in Annotation.equals which prevents it from returning false… ([#364](https://github.com/CondeNast/atjson/issues/364))

## [0.22.9](https://github.com/CondeNast/atjson/compare/@atjson/document@0.22.8...@atjson/document@0.22.9) (2019-12-20)

### 🐛 Fixes

- 🐛 use ES2018 for modules output because nullish coalescing and optional chaining is breaking

## [0.22.8](https://github.com/CondeNast/atjson/compare/@atjson/document@0.22.7...@atjson/document@0.22.8) (2019-12-20)

**Note:** Version bump only for package @atjson/document

## [0.22.7](https://github.com/CondeNast/atjson/compare/@atjson/document@0.22.6...@atjson/document@0.22.7) (2019-12-19)

**Note:** Version bump only for package @atjson/document

## [0.22.6](https://github.com/CondeNast/atjson/compare/@atjson/document@0.22.5...@atjson/document@0.22.6) (2019-12-11)

**Note:** Version bump only for package @atjson/document

## [0.22.5](https://github.com/CondeNast/atjson/compare/@atjson/document@0.22.4...@atjson/document@0.22.5) (2019-12-04)

**Note:** Version bump only for package @atjson/document

## [0.22.4](https://github.com/CondeNast/atjson/compare/@atjson/document@0.22.3...@atjson/document@0.22.4) (2019-11-18)

**Note:** Version bump only for package @atjson/document

## [0.22.3](https://github.com/CondeNast/atjson/compare/@atjson/document@0.22.2...@atjson/document@0.22.3) (2019-11-07)

**Note:** Version bump only for package @atjson/document

## [0.22.3-dev276.0](https://github.com/CondeNast/atjson/compare/@atjson/document@0.22.2...@atjson/document@0.22.3-dev276.0) (2019-11-06)

**Note:** Version bump only for package @atjson/document

## [0.22.2](https://github.com/CondeNast/atjson/compare/@atjson/document@0.22.1...@atjson/document@0.22.2) (2019-10-08)

### 🐛 Fixes

- 🐞 override `slice` on conversion document class to return slices in the original source ([#238](https://github.com/CondeNast/atjson/issues/238))

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
