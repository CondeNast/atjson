# Performance Benchmarks

## Adding a fixture

Fixtures are added under the `fixtures` directory; adding a fixture will automatically add it to performance benchmarks.

If the content in the fixture has proprietary content in it, we have a script that you can run to anonymize the content and create an equivalent article that should have similar runtime semantics. To do this, add your file to the `proprietary` directory and run `npm run anonymize-fixtures` at the project root. Your anonymized fixture will then appear in the `fixtures` directory, which is safe to commit to the repository.

**NOTE**: When adding a fixture to be anonymized, please give the file a name that describes what it's testing, not the name of the article.
