# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [0.20.0](https://github.com/CondeNast-Copilot/atjson/compare/@atjson/source-prism@0.19.0...@atjson/source-prism@0.20.0) (2019-08-26)


### ✨ New Features

* ✨ Add equal() and canonical() on the document class



## [0.19.0](https://github.com/CondeNast-Copilot/atjson/compare/@atjson/source-prism@0.17.3...@atjson/source-prism@0.19.0) (2019-08-05)

**Note:** Version bump only for package @atjson/source-prism





## [0.17.3](https://github.com/CondeNast-Copilot/atjson/compare/@atjson/source-prism@0.17.2...@atjson/source-prism@0.17.3) (2019-07-24)

**Note:** Version bump only for package @atjson/source-prism





## [0.17.2](https://github.com/CondeNast-Copilot/atjson/compare/@atjson/source-prism@0.17.1...@atjson/source-prism@0.17.2) (2019-07-23)

**Note:** Version bump only for package @atjson/source-prism





## [0.17.1](https://github.com/CondeNast-Copilot/atjson/compare/@atjson/source-prism@0.17.0...@atjson/source-prism@0.17.1) (2019-07-15)

**Note:** Version bump only for package @atjson/source-prism





## [0.17.0](https://github.com/CondeNast-Copilot/atjson/compare/@atjson/source-prism@0.16.5...@atjson/source-prism@0.17.0) (2019-07-10)


### ✨ New Features

* ✨ Generate HTML annotations from spec ([#134](https://github.com/CondeNast-Copilot/atjson/issues/134))
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


## [0.16.5](https://github.com/CondeNast/atjson/compare/@atjson/source-prism@0.16.4...@atjson/source-prism@0.16.5) (2019-04-19)

**Note:** Version bump only for package @atjson/source-prism





## [0.16.4](https://github.com/CondeNast/atjson/compare/@atjson/source-prism@0.16.3...@atjson/source-prism@0.16.4) (2019-04-18)

**Note:** Version bump only for package @atjson/source-prism





## [0.16.3](https://github.com/CondeNast/atjson/compare/@atjson/source-prism@0.16.2...@atjson/source-prism@0.16.3) (2019-04-16)

**Note:** Version bump only for package @atjson/source-prism





## [0.16.2](https://github.com/CondeNast/atjson/compare/@atjson/source-prism@0.16.1...@atjson/source-prism@0.16.2) (2019-04-15)

**Note:** Version bump only for package @atjson/source-prism





## [0.16.1](https://github.com/CondeNast/atjson/compare/@atjson/source-prism@0.16.0...@atjson/source-prism@0.16.1) (2019-04-15)

**Note:** Version bump only for package @atjson/source-prism





## [0.16.0](https://github.com/CondeNast/atjson/compare/@atjson/source-prism@0.15.9...@atjson/source-prism@0.16.0) (2019-04-10)


### ✨ New Features

* ✨ Add public app to source-html ([#123](https://github.com/CondeNast/atjson/issues/123))



## [0.15.9](https://github.com/CondeNast/atjson/compare/@atjson/source-prism@0.15.8...@atjson/source-prism@0.15.9) (2019-03-21)


### 🐛 Fixes

* 🐝 Fix unknown annotations passing attributes by reference and HIR optimization bug ([#122](https://github.com/CondeNast/atjson/issues/122))



## [0.15.8](https://github.com/CondeNast/atjson/compare/@atjson/source-prism@0.15.7...@atjson/source-prism@0.15.8) (2019-03-19)

**Note:** Version bump only for package @atjson/source-prism





## [0.15.7](https://github.com/CondeNast/atjson/compare/@atjson/source-prism@0.15.6...@atjson/source-prism@0.15.7) (2019-03-18)

**Note:** Version bump only for package @atjson/source-prism





## [0.15.6](https://github.com/CondeNast/atjson/compare/@atjson/source-prism@0.15.5...@atjson/source-prism@0.15.6) (2019-03-18)

**Note:** Version bump only for package @atjson/source-prism





## [0.15.5](https://github.com/CondeNast/atjson/compare/@atjson/source-prism@0.15.4...@atjson/source-prism@0.15.5) (2019-03-14)


### 🐛 Fixes

* 🐝🚀 Fix performance regressions ([#118](https://github.com/CondeNast/atjson/issues/118))



## [0.15.4](https://github.com/CondeNast/atjson/compare/@atjson/source-prism@0.15.3...@atjson/source-prism@0.15.4) (2019-02-27)

**Note:** Version bump only for package @atjson/source-prism





## [0.15.3](https://github.com/CondeNast/atjson/compare/@atjson/source-prism@0.15.2...@atjson/source-prism@0.15.3) (2019-02-14)

**Note:** Version bump only for package @atjson/source-prism





## [0.15.2](https://github.com/CondeNast/atjson/compare/@atjson/source-prism@0.15.1...@atjson/source-prism@0.15.2) (2019-02-14)

**Note:** Version bump only for package @atjson/source-prism





## [0.15.1](https://github.com/CondeNast/atjson/compare/@atjson/source-prism@0.15.0...@atjson/source-prism@0.15.1) (2019-02-12)

**Note:** Version bump only for package @atjson/source-prism





## [0.15.0](https://github.com/CondeNast/atjson/compare/@atjson/source-prism@0.14.1...@atjson/source-prism@0.15.0) (2019-01-24)

**Note:** Version bump only for package @atjson/source-prism





## [0.14.1](https://github.com/CondeNast/atjson/compare/@atjson/source-prism@0.14.0...@atjson/source-prism@0.14.1) (2019-01-14)


### 🐛 Fixes

* 🐝 : Include `source-html` in dependencies list



## 0.14.0 (2019-01-14)


### ✨ New Features

* ✨ add PRISM XML source to handle data from print publications
