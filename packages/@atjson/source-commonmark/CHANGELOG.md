# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [0.21.5](https://github.com/CondeNast-Copilot/atjson/compare/@atjson/source-commonmark@0.21.4...@atjson/source-commonmark@0.21.5) (2019-10-04)

**Note:** Version bump only for package @atjson/source-commonmark





## [0.21.4](https://github.com/CondeNast/atjson/compare/@atjson/source-commonmark@0.21.3...@atjson/source-commonmark@0.21.4) (2019-09-23)

**Note:** Version bump only for package @atjson/source-commonmark





## [0.21.3](https://github.com/CondeNast/atjson/compare/@atjson/source-commonmark@0.21.2...@atjson/source-commonmark@0.21.3) (2019-09-20)

**Note:** Version bump only for package @atjson/source-commonmark





## [0.21.2](https://github.com/CondeNast/atjson/compare/@atjson/source-commonmark@0.21.1...@atjson/source-commonmark@0.21.2) (2019-09-19)


### 🐛 Fixes

* 🐞 make title optional on markdown link annotations



## [0.21.1](https://github.com/CondeNast/atjson/compare/@atjson/source-commonmark@0.21.0...@atjson/source-commonmark@0.21.1) (2019-09-17)

**Note:** Version bump only for package @atjson/source-commonmark





## [0.21.0](https://github.com/CondeNast/atjson/compare/@atjson/source-commonmark@0.19.1...@atjson/source-commonmark@0.21.0) (2019-09-12)


### 🐛 Fixes

* 🐞 Make Image description a string (fixes [#189](https://github.com/CondeNast/atjson/issues/189))


### 🚨 Breaking Changes

* If you are using the Image annotation, you will need to change your component or render function to handle description as a string, not as a document


## [0.19.1](https://github.com/CondeNast-Copilot/atjson/compare/@atjson/source-commonmark@0.19.0...@atjson/source-commonmark@0.19.1) (2019-08-26)

**Note:** Version bump only for package @atjson/source-commonmark





## [0.19.0](https://github.com/CondeNast-Copilot/atjson/compare/@atjson/source-commonmark@0.17.3...@atjson/source-commonmark@0.19.0) (2019-08-05)

**Note:** Version bump only for package @atjson/source-commonmark





## [0.17.3](https://github.com/CondeNast-Copilot/atjson/compare/@atjson/source-commonmark@0.17.2...@atjson/source-commonmark@0.17.3) (2019-07-24)

**Note:** Version bump only for package @atjson/source-commonmark





## [0.17.2](https://github.com/CondeNast-Copilot/atjson/compare/@atjson/source-commonmark@0.17.1...@atjson/source-commonmark@0.17.2) (2019-07-23)

**Note:** Version bump only for package @atjson/source-commonmark





## [0.17.1](https://github.com/CondeNast-Copilot/atjson/compare/@atjson/source-commonmark@0.17.0...@atjson/source-commonmark@0.17.1) (2019-07-15)

**Note:** Version bump only for package @atjson/source-commonmark





## [0.17.0](https://github.com/CondeNast-Copilot/atjson/compare/@atjson/source-commonmark@0.14.16...@atjson/source-commonmark@0.17.0) (2019-07-10)


### ✨ New Features

* ✨ Reduce magic in converting documents. ([#132](https://github.com/CondeNast-Copilot/atjson/issues/132))


### 🐛 Fixes

* 🐞 Fix references to wrong github repository ([#135](https://github.com/CondeNast-Copilot/atjson/issues/135))


### 🚨 Breaking Changes

* When converting a document, it will no longer coerce a document. You will need to do this yourself!
* You can no longer nest converters inside of another converter. Instead import `getConverterFor` from @atjson/document and use the function supplied from that.

These improvements are designed to improve the developer experience of atjson for developers. We've encountered some frustrations where:

1. Conversions wouldn't run because there are two different versions of @atjson/document installed.

    📝 If you are using atjson, update your dependencies to this version. Any version increment after this shouldn't break your converters.

2. Converters would get called, but the document was made up of only UnknownAnnotations.

    👩🏽‍🏫 You're no longer allowed to nest converters. This change was done to make converting less confusing, because it was super weird to have all your annotations be "Unknown" if you ran a converter before running the rest of your conversion code. Also, it will no longer clone the document, so this should hopefully make some conversions speedier! 🐰

3. It was unclear when convertTo would actually run any code.

     📣We've changed this so all converters are user-defined code. If there is no converter defined, it will let you know!


## [0.14.16](https://github.com/CondeNast/atjson/compare/@atjson/source-commonmark@0.14.15...@atjson/source-commonmark@0.14.16) (2019-04-19)

**Note:** Version bump only for package @atjson/source-commonmark





## [0.14.15](https://github.com/CondeNast/atjson/compare/@atjson/source-commonmark@0.14.14...@atjson/source-commonmark@0.14.15) (2019-04-18)

**Note:** Version bump only for package @atjson/source-commonmark





## [0.14.14](https://github.com/CondeNast/atjson/compare/@atjson/source-commonmark@0.14.13...@atjson/source-commonmark@0.14.14) (2019-04-15)

**Note:** Version bump only for package @atjson/source-commonmark





## [0.14.13](https://github.com/CondeNast/atjson/compare/@atjson/source-commonmark@0.14.12...@atjson/source-commonmark@0.14.13) (2019-04-15)

**Note:** Version bump only for package @atjson/source-commonmark





## [0.14.12](https://github.com/CondeNast/atjson/compare/@atjson/source-commonmark@0.14.11...@atjson/source-commonmark@0.14.12) (2019-04-10)

**Note:** Version bump only for package @atjson/source-commonmark





## [0.14.11](https://github.com/CondeNast/atjson/compare/@atjson/source-commonmark@0.14.10...@atjson/source-commonmark@0.14.11) (2019-03-21)

**Note:** Version bump only for package @atjson/source-commonmark





## [0.14.10](https://github.com/CondeNast/atjson/compare/@atjson/source-commonmark@0.14.9...@atjson/source-commonmark@0.14.10) (2019-03-19)


### 🐛 Fixes

* 🐝 : Remove code for parcel workaround ([#121](https://github.com/CondeNast/atjson/issues/121))



## [0.14.9](https://github.com/CondeNast/atjson/compare/@atjson/source-commonmark@0.14.8...@atjson/source-commonmark@0.14.9) (2019-03-18)

**Note:** Version bump only for package @atjson/source-commonmark





## [0.14.8](https://github.com/CondeNast/atjson/compare/@atjson/source-commonmark@0.14.7...@atjson/source-commonmark@0.14.8) (2019-03-18)


### 🐛 Fixes

* 🚀🐛 Performance fixes ([#119](https://github.com/CondeNast/atjson/issues/119))



## [0.14.7](https://github.com/CondeNast/atjson/compare/@atjson/source-commonmark@0.14.6...@atjson/source-commonmark@0.14.7) (2019-03-14)

**Note:** Version bump only for package @atjson/source-commonmark





## [0.14.6](https://github.com/CondeNast/atjson/compare/@atjson/source-commonmark@0.14.5...@atjson/source-commonmark@0.14.6) (2019-02-27)

**Note:** Version bump only for package @atjson/source-commonmark





## [0.14.5](https://github.com/CondeNast/atjson/compare/@atjson/source-commonmark@0.14.4...@atjson/source-commonmark@0.14.5) (2019-02-15)


### 🐛 Fixes

* 🐝 Revert previous change in favor of better fix



## [0.14.4](https://github.com/CondeNast/atjson/compare/@atjson/source-commonmark@0.14.3...@atjson/source-commonmark@0.14.4) (2019-02-14)


### 🐛 Fixes

* 🐝 Include whitespace at paragraph boundaries



## [0.14.3](https://github.com/CondeNast/atjson/compare/@atjson/source-commonmark@0.14.2...@atjson/source-commonmark@0.14.3) (2019-02-14)

**Note:** Version bump only for package @atjson/source-commonmark





## [0.14.2](https://github.com/CondeNast/atjson/compare/@atjson/source-commonmark@0.14.1...@atjson/source-commonmark@0.14.2) (2019-02-14)

**Note:** Version bump only for package @atjson/source-commonmark





## [0.14.1](https://github.com/CondeNast/atjson/compare/@atjson/source-commonmark@0.14.0...@atjson/source-commonmark@0.14.1) (2019-02-12)

**Note:** Version bump only for package @atjson/source-commonmark





## [0.14.0](https://github.com/CondeNast/atjson/compare/@atjson/source-commonmark@0.13.8...@atjson/source-commonmark@0.14.0) (2019-01-24)

**Note:** Version bump only for package @atjson/source-commonmark





## [0.13.8](https://github.com/CondeNast/atjson/compare/@atjson/source-commonmark@0.13.7...@atjson/source-commonmark@0.13.8) (2019-01-14)


### 🐛 Fixes

* 🐞 pass closing token in addition to the opening token ([#99](https://github.com/CondeNast/atjson/issues/99))



## [0.13.7](https://github.com/CondeNast/atjson/compare/@atjson/source-commonmark@0.13.6...@atjson/source-commonmark@0.13.7) (2019-01-14)

**Note:** Version bump only for package @atjson/source-commonmark





## [0.13.6](https://github.com/CondeNast/atjson/compare/@atjson/source-commonmark@0.13.5...@atjson/source-commonmark@0.13.6) (2019-01-09)

**Note:** Version bump only for package @atjson/source-commonmark





## [0.13.5](https://github.com/CondeNast/atjson/compare/@atjson/source-commonmark@0.13.4...@atjson/source-commonmark@0.13.5) (2019-01-07)

**Note:** Version bump only for package @atjson/source-commonmark





## [0.13.4](https://github.com/CondeNast/atjson/compare/@atjson/source-commonmark@0.13.3...@atjson/source-commonmark@0.13.4) (2018-12-11)


### 🐛 Fixes

* 🐛 fix tsc errors causing lerna to fail to build



## [0.13.3](https://github.com/CondeNast/atjson/compare/@atjson/source-commonmark@0.13.2...@atjson/source-commonmark@0.13.3) (2018-12-11)

**Note:** Version bump only for package @atjson/source-commonmark





## [0.13.2](https://github.com/CondeNast/atjson/compare/@atjson/source-commonmark@0.13.1...@atjson/source-commonmark@0.13.2) (2018-12-11)

**Note:** Version bump only for package @atjson/source-commonmark





## [0.13.1](https://github.com/CondeNast/atjson/compare/@atjson/source-commonmark@0.13.0...@atjson/source-commonmark@0.13.1) (2018-12-11)

**Note:** Version bump only for package @atjson/source-commonmark





## [0.13.0](https://github.com/CondeNast/atjson/compare/@atjson/source-commonmark@0.12.0...@atjson/source-commonmark@0.13.0) (2018-12-11)


### ✨ New Features

* ✨ Coerce or convert to sources ([#93](https://github.com/CondeNast/atjson/issues/93))



## [0.12.0](https://github.com/CondeNast/atjson/compare/@atjson/source-commonmark@0.11.0...@atjson/source-commonmark@0.12.0) (2018-11-29)


### ✨ New Features

* ✨📡 dynamically convert between types of sources ([#88](https://github.com/CondeNast/atjson/issues/88))



## [0.11.0](https://github.com/CondeNast/atjson/compare/@atjson/source-commonmark@0.9.0...@atjson/source-commonmark@0.11.0) (2018-10-22)


### ✨ New Features

* ✨👑✨ Make Annotations classes instead of JS objects ([#57](https://github.com/CondeNast/atjson/issues/57))

## [0.9.0](https://github.com/CondeNast/atjson/compare/@atjson/source-commonmark@0.8.11...@atjson/source-commonmark@0.9.0) (2018-10-10)


### ✨ New Features

* ✨🤠 Typed Annotation Collections / Joins! ([#85](https://github.com/CondeNast/atjson/issues/85))



## [0.8.11](https://github.com/CondeNast/atjson/compare/@atjson/source-commonmark@0.8.10...@atjson/source-commonmark@0.8.11) (2018-09-14)

**Note:** Version bump only for package @atjson/source-commonmark


## [0.8.10](https://github.com/CondeNast/atjson/compare/@atjson/source-commonmark@0.8.9...@atjson/source-commonmark@0.8.10) (2018-09-07)

**Note:** Version bump only for package @atjson/source-commonmark


## [0.8.9](https://github.com/CondeNast/atjson/compare/@atjson/source-commonmark@0.8.8...@atjson/source-commonmark@0.8.9) (2018-09-04)

**Note:** Version bump only for package @atjson/source-commonmark


## 0.8.8 (2018-08-02)

**Note:** Version bump only for package @atjson/source-commonmark


## 0.8.4 (2018-07-25)

**Note:** Version bump only for package @atjson/source-commonmark


## 0.8.2 (2018-05-23)

**Note:** Version bump only for package @atjson/source-commonmark


## 0.8.1 (2018-05-22)

**Note:** Version bump only for package @atjson/source-commonmark


## 0.8.0 (2018-05-14)

**Note:** Version bump only for package @atjson/source-commonmark


## 0.7.16 (2018-04-27)

**Note:** Version bump only for package @atjson/source-commonmark
