# conventional-commits

We use emoji for our conventional commits! ✌️

Conventional commits is designed to make it easy to generate a list of changes of software from version to version without someone having to write it by hand. Our software that we use to manage atjson, lerna, supports this standard and we're extending it to make it more friendly for folks who find it easier to look at emoji instead of abbreviated text.

Below is a guide to what each emoji means and how it relates to [Conventional Commits](https://conventionalcommits.org/).

| Emoji | Conventional Commits | What does it mean? | Is this included in changelog? |
|-------|----------|-------------|-----------------------|
| 📦 | chore(package) | Package updates / release (bower, npm, etc) | |
| 💅 | chore(style) | Style changes (code style, css style, etc) | |
| 💄 | chore(style) | Style changes (code style, css style, etc) | |
| 🐛 | fix | Bug fix | ✅ |
| 🐝 | fix | Bug fix | ✅ |
| 🚥 | chore(test) | Tests | |
| 🚦 | chore(test) | Tests | |
| 🔒 | fix(security) | This is a security patch | ✅ |
| 📓 | chore(docs) | Documentation (README / code docs) | |
| 📚 | chore(docs) | Documentation (README / code docs) | |
| 🚀 | fix(performance) | Performance patch | ✅ |
| ✨ | feat | Feature | ✅ |
| 🎉 | feat| Feature | ✅ |
| 🎊 | feat | Feature | ✅ |
| 👨‍⚕️ | chore(refactor) | Refactor | |
| 👩‍⚕️ | chore(refactor) | Refactor | |
| 🚨 | BREAKING CHANGE | Breaking change | ✅ |
| 🗻 | chore(ci) | Code Climate changes | |
| 👷‍♀️ | chore(ci) | TravisCI updates | |
| 👷‍♂️ | chore(ci) | TravisCI updates | |
| 👩‍⚖️ | chore(legal) | Update legal documentation | |
| 👨‍⚖️ | chore(legal) | Update legal documentation | |
| ⚖️ | chore(legal) | Update legal documentation | |

PS: Use any skin tone you want– we'll detect it regardless of the skin tone and mark it under the correct tag 😘

#### 🙋‍♀️ Do you have an emoji that you'd like to add?

Add your emoji to (this spreadsheet)[https://github.com/CondeNast-Copilot/atjson/tree/latest/packages/%40atjson/conventional-commits/src/emoji.csv] with the heading that it should live under, the severity of the change, and a 🚫 or ✅ indicating whether it should be included in the changelog.

The severity can be one of the following:

- `patch` indicates fixes and other changes
- `minor` indicates new features (and possibly fixes as well)
- `major` / `breaking` indicates that the software now works differently and will need to be updated accordingly

#### 👉 Examples

| Examples (taken from atjson) |
|------------------------------|
| 🐛📓 copyedit lerna -> Lerna | 
| 🚦👷‍♀️ hoist modules, and run linting on Travis |
| ✨ add support for blockquote |
| 🎉📋 add support for links from Google Docs paste buffers |

This will output the following changelog:

### ✨ New Features

* ✨ add support for blockquote
* 🎉📋 add support for links from Google Docs paste buffers
