# ⏱ Performance

The metrics below are taken from the CommonMark specification tests. These are _not_ realistic examples of what you'd find out in the world, but it is a fairly large dataset that runs the code through its paces.

This benchmark was taken on macOS High Sierra on x64 with 8 cores of Intel(R) Core(TM) i7-4870HQ CPU @ 2.50GHz.

| Function | Mean | Median | 95th Percentile | Standard Deviation |
|----------|------|--------|-----------------|--------------------|
| CommonMarkSource.fromRaw | 0.604ms | 0.491ms | 1.239ms | 0.402ms |
| CommonMarkSource.convertTo(OffsetSource) | 0.480ms | 0.377ms | 1.009ms | 0.323ms |
| CommonMarkRenderer.render | 0.409ms | 0.304ms | 0.935ms | 0.344ms |
| MarkdownIt.render | 0.089ms | 0.074ms | 0.156ms | 0.112ms |
| Round trip | 1.569ms | 1.328ms | 3.050ms | 0.871ms |
