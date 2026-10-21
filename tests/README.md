# ✅ Integration tests

This is where you can write end-to-end tests and tests that incorporate more than one package in atjson for testing.

The `fixtures` directory is intended as a library of supported sets of content, which are primarily used for round trip tests. When testing a "round trip", we are checking that the content that we get into atjson and the data we get out of atjson doesn't drop data. This is a fairly high level check that allows us to assert that we're not incurring data loss.

## HTML round-trip preservation checks

Run the focused checks with the repository's declared Node version:

```sh
npm run test:html-round-trip
ATJSON_HTML_ROUND_TRIP_REPORT=/tmp/atjson-html-round-trip.json npm run test:html-round-trip
```

The test compares canonical, stably serialized documents before and after
HTML rendering/parsing. A Jest reporter collects the executed assertion results,
prints their preservation classification and optionally writes the JSON report.
The test file itself does not write reports. The app coordinator consumes this
report as local development evidence; it is not the trusted automatic CI oracle.

### Why the old suite passed

At `main` revision `8f4548451bb945aab403f698dea033302c8b5dd6`, the HTML suite
rendered and reparsed every fixture but never asserted that the resulting
document equaled the input. Reproduction on that source gave **11 passing fixture
tests with zero passing assertions each**. Adding canonical document equality to
the same source exposed four semantic discrepancies; seven fixtures preserved
their documents. A green result from the original suite therefore did not prove
round-trip preservation.

The four cases are `ceros.html`, `ceros-with-mobile-aspect-ratio.html`,
`threads.html` and `twitter.html`. Their source packages and HTML fixtures are
unchanged from the recorded baseline in the [discrepancy registry](html-round-trip-known-failures.json).
They are existing embed-conversion discrepancies, not four new failing Jest tests
introduced by this workflow PR.

### Interpreting current results

- **Pass:** the canonical documents match.
- **Known failure:** the test executed and reproduced the exact registered
  semantic discrepancy with the same fixture hash, accountable owner/issue and
  unexpired review. The assertion passed; preservation still has a known defect.
- **Fail:** an unregistered discrepancy, changed signature/input, expired record,
  unexpected fix, failed assertion or incomplete required execution needs review.

The registered cases are not skipped. The current suite passes only while its
normal preservation assertions and exact known-discrepancy assertions hold.
A requested JSON report rejects missing, duplicate or skipped required results
rather than counting an absent case as successful. A focused Jest debug run
without a report request retains normal test selection; it does not establish
coverage of the complete HTML route.

Fixing one of these product defects requires a focused regression and review of
the corresponding record; an unexpected pass deliberately fails until then.
Do not update hashes or expiry merely to obtain green checks. New or affected
Pullquote failures cannot be added to this list of unrelated baseline defects.
