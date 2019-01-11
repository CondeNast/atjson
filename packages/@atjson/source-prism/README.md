# 🌈 @atjson/source-prism

## 💁‍♀️ What is PRISM

PRISM is an acronym for Publishing Requirements for Industry Standard Metadata. The format is used in publishing to provide information about published works, primarily those that are printed in magazines, books, or other media.

Brands at Condé Nast such as the New Yorker, WIRED, and Vogue have versions of their print magazines annotated in PRISM XML that provides necessary metadata for our teams to extract data from.

## 🖍 How to use

Read the XML as a string and pass it directly to the PRISM source:

```typescript
import PRISMSource from '@atjson/source-prism';

let prism = PRISMSource.fromRaw(xml);
```

From here, you can do all the things you'd do in other sources, like convert to another source, and render out to other sources.

## 🤷‍♀️ How can I test my XML?

We've supplied a little application alongside this package, which can be run using `npm start` from inside `@atjson/source-prism`. Once the app's running, you can navigate to [`localhost:1234`](http://localhost:1234).
