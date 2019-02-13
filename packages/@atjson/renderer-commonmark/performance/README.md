# ⏱ Performance

The metrics below are taken from the CommonMark specification tests. These are _not_ realistic examples of what you'd find out in the world, but it is a fairly large dataset that runs the code through its paces.

This benchmark was taken on macOS High Sierra on x64 with 8 cores of Intel(R) Core(TM) i7-4870HQ CPU @ 2.50GHz.

| Function | Median | 95th Percentile | Standard Deviation |
|----------|--------|-----------------|--------------------|
| CommonMarkSource.fromRaw | 0.428ms | 1.043ms | 0.356ms |
| CommonMarkSource.convertTo(OffsetSource) | 0.327ms | 0.940ms | 0.300ms |
| CommonMarkRenderer.render | 0.250ms | 0.851ms | 0.312ms |
| MarkdownIt.render | 0.061ms | 0.128ms | 0.095ms |
| Round trip | 1.115ms | 2.659ms | 0.783ms |
