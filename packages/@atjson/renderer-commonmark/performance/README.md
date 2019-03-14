# ⏱ Performance

The metrics below are taken from the CommonMark specification tests. These are _not_ realistic examples of what you'd find out in the world, but it is a fairly large dataset that runs the code through its paces.

This benchmark was taken on Linux 4.4 on x64 with 2 cores of Intel(R) Xeon(R) CPU @ 2.60GHz.

| Function | Mean | Median | 95th Percentile | Standard Deviation |
|----------|------|--------|-----------------|--------------------|
| CommonMarkSource.fromRaw | 0.554ms | 0.468ms | 0.736ms | 0.450ms |
| CommonMarkSource.convertTo(OffsetSource) | 0.532ms | 0.427ms | 1.094ms | 0.472ms |
| CommonMarkRenderer.render | 0.208ms | 0.170ms | 0.427ms | 0.200ms |
| Round trip | 1.366ms | 1.143ms | 3.014ms | 0.815ms |


## 🔥 Slow real-life examples

The metrics below are taken from real articles written by Condé Nast editors / writers.

This benchmark was taken on Linux 4.4 on x64 with 2 cores of Intel(R) Xeon(R) CPU @ 2.60GHz.

| Function | Mean | Median | 95th Percentile | Standard Deviation |
|----------|------|--------|-----------------|--------------------|
| CommonMarkSource.fromRaw | 19.262ms | 14.012ms | 30.479ms | 10.723ms |
| CommonMarkSource.convertTo(OffsetSource) | 86.309ms | 57.265ms | 111.472ms | 52.242ms |
| CommonMarkRenderer.render | 133.624ms | 107.191ms | 169.084ms | 29.526ms |
| Round trip | 239.399ms | 177.708ms | 299.690ms | 85.638ms |
