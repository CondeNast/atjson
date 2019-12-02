# ✅ Integration tests

This is where you can write end-to-end tests and tests that incorporate more than one package in atjson for testing.

The `fixtures` directory is intended as a library of supported sets of content, which are primarily used for round trip tests. When testing a "round trip", we are checking that the content that we get into atjson and the data we get out of atjson doesn't drop data. This is a fairly high level check that allows us to assert that we're not incurring data loss.
