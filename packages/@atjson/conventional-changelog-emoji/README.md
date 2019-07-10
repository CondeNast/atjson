# ✌️ conventional-changelog-emoji

[Conventional Commits](https://conventionalcommits.org/) is a community standard designed to generate software changes automatically.

We use emoji for our conventional commits to reduce technical jargon in our software.

Commits look like `✌️ My awesome change (#12)`. There’s emoji at the beginning, the description of the changes made in the middle and the number referencing the GitHub pull request at the end.

### ❤️ Supported emoji

| Emoji | Changelog Heading | Severity | Included in Changelog? |
|-|-|-|-|
|🏗|🏗 Build Changes|patch|🚫|
|📦|📦 npm changes|patch|🚫|
|🚨|🚨 Breaking Changes|breaking|✅|
|👷‍♀️|👷‍♀️ TravisCI|patch|🚫|
|👷‍♂️|👷‍♂️ TravisCI|patch|🚫|
|🗻|🗻 CodeClimate|patch|🚫|
|👩‍⚖️|⚖️ Licensing Changes|major|✅|
|👨‍⚖️|⚖️ Licensing Changes|major|✅|
|⚖️|⚖️ Licensing Changes|major|✅|
|📓|📚 Documentation|patch|🚫|
|📚|📚 Documentation|patch|🚫|
|✨|✨ New Features|minor|✅|
|🎉|✨ New Features|minor|✅|
|🎊|✨ New Features|minor|✅|
|🐛|🐛 Fixes|patch|✅|
|🐝|🐛 Fixes|patch|✅|
|🔒|🔒 Security Updates|patch|✅|
|🚀|🚀 Performance|patch|🚫|
|🛀|🛀 Code Cleanup|patch|🚫|
|⏪|⏪ Undo Changes|revert|🚫|
|💅|💄 Style|patch|🚫|
|💄|💄 Style|patch|🚫|
|🎨|💄 Style|patch|🚫|
|🚦|🚦 Tests|patch|🚫|
|🚥|🚦 Tests|patch|🚫|

<small>PS: Use any skin tone you want– we'll detect it regardless of the skin tone and put it under the correct heading 😘</small>

### 🙋‍♀️ Do you have an emoji that you'd like to add?

Add your emoji to [this spreadsheet](https://github.com/CondeNast/atjson/tree/latest/packages/%40atjson/conventional-commits/src/emoji.csv) with the heading that it should live under, the severity of the change, and a 🚫 or ✅ indicating whether it should be included in the changelog.

The severity can be one of the following:

- `patch` indicates fixes and other changes
- `minor` indicates new features (and possibly fixes as well)
- `major` / `breaking` indicates that the software now works differently and will need to be updated accordingly

### 👉 Examples

Let’s use the commit examples used above:

- 📦 Release 0.2.8
- 🐛 Fix nested bold and italic markdown output ([#32](https://github.com/CondeNast/atjson/issues/24))
- 🎉 Add horizontal rule and vertical adjustments for Google Docs paste ([#52](https://github.com/CondeNast/atjson/issues/52))
- ✨👑✨ Make Annotations classes instead of JS objects ([#54](](https://github.com/CondeNast/atjson/issues/54)))\
\
  🚨 Schemas are now defined as a list of annotation classes, cf. `[Bold, Italic]`

And show what will be our changelog!

### 🐛 Fixes

* 🐛 Fix nested bold and italic markdown output ([#32](https://github.com/CondeNast/atjson/issues/24))

### ✨ New Features

* ✨👑✨ Make Annotations classes instead of JS objects ([#54](](https://github.com/CondeNast/atjson/issues/54)))
* 🎉 Add horizontal rule and vertical adjustments for Google Docs paste ([#52](https://github.com/CondeNast/atjson/issues/52))

### 🚨 Breaking Changes

* Schemas are now defined as a list of annotation classes, cf. `[Bold, Italic]`
