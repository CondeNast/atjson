:tipping_hand_woman: AtJSON has a [Code of Conduct](https://github.com/CondeNast-Copilot/atjson/blob/latest/CODE_OF_CONDUCT.md) that we expect all of our contributors to abide by, please check it out before contributing!

***

AtJSON is comprised of a bunch of packages, monorepo style. We use [:dragon:lerna](https://lernajs.io) to manage these dependencies.

:computer: To get started, clone atjson onto your computer and navigate into the project.

```bash
git clone https://github.com/CondeNast-Copilot/atjson.git
cd atjson
```

Now install the dependencies :sparkles:

```bash
npm install
lerna bootstrap --hoist
```

And run the tests: :woman_scientist:

```bash
npm test
```

We use [:black_joker:Jest](https://facebook.github.io/jest) to run our tests, which is \~fantastic\~, if you ask us. We recommend looking at Jest's documentation for [expectations](https://facebook.github.io/jest/docs/en/expect.html) to get started writing these. If you want to run tests for a specific package, you can do so by navigating to that package and running:

```bash
npm test
```

If you're doing some test driven development, you can continuously run this by running:

```bash
npm test -- --watch
```

And if you've caused some snapshots to become invalid, you can regenerate the snapshots by running:

```bash
npm test -- -u
```

To build the TypeScript into JavaScript for `npm`, use `lerna`:

```bash
lerna run build
```

You can also run the TypeScript linter to check your code for style issues:

```bash
lerna run lint
```

:heart: Happy Contributing :heart:
