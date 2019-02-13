# ⏱ Performance
The metrics below are taken from the CommonMark specification tests. These are _not_ realistic examples of what you'd find out in the world, but it is a fairly large dataset that runs the code through its paces.

This benchmark was taken on Linux 4.4 on x64 with 2 cores of Intel(R) Xeon(R) CPU @ 2.30GHz.

| Function | Mean | Median | 95th Percentile | Standard Deviation |
|----------|------|--------|-----------------|--------------------|
| CommonMarkSource.fromRaw | 0.490ms | 0.409ms | 0.714ms | 0.386ms |
| CommonMarkSource.convertTo(OffsetSource) | 0.446ms | 0.357ms | 0.931ms | 0.386ms |
| CommonMarkRenderer.render | 0.305ms | 0.234ms | 0.704ms | 0.305ms |
| MarkdownIt.render | 0.039ms | 0.034ms | 0.066ms | 0.054ms |
| Round trip | 1.301ms | 1.074ms | 2.935ms | 0.764ms |