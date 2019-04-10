# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [0.13.6](https://github.com/CondeNast-Copilot/atjson/compare/@atjson/renderer-hir@0.13.5...@atjson/renderer-hir@0.13.6) (2019-04-10)


### 🐛 Fixes

* 🐛 ⚛️ Fix React Renderer so it works again ([#124](https://github.com/CondeNast-Copilot/atjson/issues/124))



## [0.13.5](https://github.com/CondeNast-Copilot/atjson/compare/@atjson/renderer-hir@0.13.4...@atjson/renderer-hir@0.13.5) (2019-03-21)

**Note:** Version bump only for package @atjson/renderer-hir





## [0.13.4](https://github.com/CondeNast-Copilot/atjson/compare/@atjson/renderer-hir@0.13.3...@atjson/renderer-hir@0.13.4) (2019-03-19)

**Note:** Version bump only for package @atjson/renderer-hir





## [0.13.3](https://github.com/CondeNast-Copilot/atjson/compare/@atjson/renderer-hir@0.13.2...@atjson/renderer-hir@0.13.3) (2019-03-18)

**Note:** Version bump only for package @atjson/renderer-hir





## [0.13.2](https://github.com/CondeNast-Copilot/atjson/compare/@atjson/renderer-hir@0.13.1...@atjson/renderer-hir@0.13.2) (2019-03-18)


### 🐛 Fixes

* 🚀🐛 Performance fixes ([#119](https://github.com/CondeNast-Copilot/atjson/issues/119))



## [0.13.1](https://github.com/CondeNast-Copilot/atjson/compare/@atjson/renderer-hir@0.13.0...@atjson/renderer-hir@0.13.1) (2019-03-14)

**Note:** Version bump only for package @atjson/renderer-hir





## [0.13.0](https://github.com/CondeNast-Copilot/atjson/compare/@atjson/renderer-hir@0.12.1...@atjson/renderer-hir@0.13.0) (2019-02-14)


### ✨ New Features

* 🍢✨ Allow using classified names for rendering hooks (`Bold` & `bold` / `GiphyEmbed` & `giphy-embed`) ([#107](https://github.com/CondeNast-Copilot/atjson/issues/107))



## [0.12.1](https://github.com/CondeNast-Copilot/atjson/compare/@atjson/renderer-hir@0.12.0...@atjson/renderer-hir@0.12.1) (2019-02-12)

**Note:** Version bump only for package @atjson/renderer-hir





## [0.12.0](https://github.com/CondeNast-Copilot/atjson/compare/@atjson/renderer-hir@0.11.9...@atjson/renderer-hir@0.12.0) (2019-01-24)

**Note:** Version bump only for package @atjson/renderer-hir





## [0.11.9](https://github.com/CondeNast-Copilot/atjson/compare/@atjson/renderer-hir@0.11.8...@atjson/renderer-hir@0.11.9) (2019-01-14)

**Note:** Version bump only for package @atjson/renderer-hir





## [0.11.8](https://github.com/CondeNast-Copilot/atjson/compare/@atjson/renderer-hir@0.11.7...@atjson/renderer-hir@0.11.8) (2019-01-09)

**Note:** Version bump only for package @atjson/renderer-hir





## [0.11.7](https://github.com/CondeNast-Copilot/atjson/compare/@atjson/renderer-hir@0.11.6...@atjson/renderer-hir@0.11.7) (2019-01-07)

**Note:** Version bump only for package @atjson/renderer-hir





## [0.11.6](https://github.com/CondeNast-Copilot/atjson/compare/@atjson/renderer-hir@0.11.5...@atjson/renderer-hir@0.11.6) (2018-12-11)

**Note:** Version bump only for package @atjson/renderer-hir





## [0.11.5](https://github.com/CondeNast-Copilot/atjson/compare/@atjson/renderer-hir@0.11.4...@atjson/renderer-hir@0.11.5) (2018-12-11)

**Note:** Version bump only for package @atjson/renderer-hir





## [0.11.4](https://github.com/CondeNast-Copilot/atjson/compare/@atjson/renderer-hir@0.11.3...@atjson/renderer-hir@0.11.4) (2018-12-11)

**Note:** Version bump only for package @atjson/renderer-hir





## [0.11.3](https://github.com/CondeNast-Copilot/atjson/compare/@atjson/renderer-hir@0.11.2...@atjson/renderer-hir@0.11.3) (2018-12-11)

**Note:** Version bump only for package @atjson/renderer-hir





## [0.11.2](https://github.com/CondeNast-Copilot/atjson/compare/@atjson/renderer-hir@0.11.1...@atjson/renderer-hir@0.11.2) (2018-12-11)

**Note:** Version bump only for package @atjson/renderer-hir


## [0.11.1](https://github.com/CondeNast-Copilot/atjson/compare/@atjson/renderer-hir@0.11.0...@atjson/renderer-hir@0.11.1) (2018-11-29)

**Note:** Version bump only for package @atjson/renderer-hir


## [0.11.0](https://github.com/CondeNast-Copilot/atjson/compare/@atjson/renderer-hir@0.10.0...@atjson/renderer-hir@0.11.0) (2018-10-22)


### ✨ New Features

* ✨👑✨ Make Annotations classes instead of JS objects ([#57](https://github.com/CondeNast-Copilot/atjson/issues/57))


### 🚨 Breaking Changes

* This introduces a bunch of breaking changes to AtJSON. The major change is that Annotations are now described as classes instead of a loose schema.

🎨 Renderers now take `Annotation`s instead of the `attributes`.  When additional context is required to render an annotation, a `context` object is passed as the second argument, which provides references to the `parent`, `next`, `previous`, and `children` annotations to the current annotation.


## [0.10.0](https://github.com/CondeNast-Copilot/atjson/compare/@atjson/renderer-hir@0.9.3...@atjson/renderer-hir@0.10.0) (2018-10-10)


### ✨ New Features

* ✨🤠 Typed Annotation Collections / Joins! ([#85](https://github.com/CondeNast-Copilot/atjson/issues/85))



## [0.9.3](https://github.com/CondeNast-Copilot/atjson/compare/@atjson/renderer-hir@0.9.2...@atjson/renderer-hir@0.9.3) (2018-09-14)

**Note:** Version bump only for package @atjson/renderer-hir


## [0.9.2](https://github.com/CondeNast-Copilot/atjson/compare/@atjson/renderer-hir@0.9.1...@atjson/renderer-hir@0.9.2) (2018-09-07)

**Note:** Version bump only for package @atjson/renderer-hir


## [0.9.1](https://github.com/CondeNast-Copilot/atjson/compare/@atjson/renderer-hir@0.9.0...@atjson/renderer-hir@0.9.1) (2018-09-04)

## 0.9.0 (2018-08-02)


### ✨ New Features

* ✨ allow a HIR to be passed to a renderer ([#73](https://github.com/CondeNast-Copilot/atjson/issues/73))

## 0.8.4 (2018-07-25)

**Note:** Version bump only for package @atjson/renderer-hir

## 0.8.0 (2018-05-14)

**Note:** Version bump only for package @atjson/renderer-hir

## 0.7.16 (2018-04-27)

**Note:** Version bump only for package @atjson/renderer-hir
