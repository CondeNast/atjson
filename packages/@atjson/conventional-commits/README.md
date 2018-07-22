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


#### 👉 Examples

| Examples (taken from atjson) |
|------------------------------|
| 🐛📓 copyedit lerna -> Lerna | 
| 🚦👷‍♀️ hoist modules, and run linting on Travis |
| ✨ add support for blockquote |
| 🎉📋 add support for links from Google Docs paste buffers |
