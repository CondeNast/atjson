# ⏱ Performance
The metrics below are taken from the CommonMark specification tests. These are _not_ realistic examples of what you'd find out in the world, but it is a fairly large dataset that runs the code through its paces.

This benchmark was taken on Linux 4.4 on x64 with 2 cores of Intel(R) Xeon(R) CPU @ 2.30GHz.

| Function | Mean | Median | 95th Percentile | Standard Deviation |
|----------|------|--------|-----------------|--------------------|
| CommonMarkSource.fromRaw | 0.514ms | 0.424ms | 0.685ms | 0.450ms |
| CommonMarkSource.convertTo(OffsetSource) | 0.451ms | 0.361ms | 0.931ms | 0.406ms |
| CommonMarkRenderer.render | 0.308ms | 0.234ms | 0.699ms | 0.351ms |
| Round trip | 1.332ms | 1.092ms | 3.121ms | 0.826ms |
