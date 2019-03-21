# ⏱ Performance

The metrics below are taken from the CommonMark specification tests. These are _not_ realistic examples of what you'd find out in the world, but it is a fairly large dataset that runs the code through its paces.

This benchmark was taken on Linux 4.4 on x64 with 2 cores of Intel(R) Xeon(R) CPU @ 2.50GHz.

| Function | Mean | Median | 95th Percentile | Maximum | Standard Deviation |
|----------|------|--------|-----------------|---------|--------------------|
| CommonMarkSource.fromRaw | 0.537ms | 0.447ms | 0.749ms | 14.923424ms | 0.461ms |
| CommonMarkSource.convertTo(OffsetSource) | 0.350ms | 0.273ms | 0.686ms | 19.071475ms | 0.398ms |
| CommonMarkRenderer.render | 0.121ms | 0.100ms | 0.225ms | 15.635972ms | 0.153ms |
| Round trip | 1.066ms | 0.885ms | 2.039ms | 20.8971ms | 0.697ms |


## 🔥 Slow real-life examples

The metrics below are taken from real articles written by Condé Nast editors / writers.

This benchmark was taken on Linux 4.4 on x64 with 2 cores of Intel(R) Xeon(R) CPU @ 2.50GHz.

| Function | Mean | Median | 95th Percentile | Maximum | Standard Deviation |
|----------|------|--------|-----------------|---------|--------------------|
| CommonMarkSource.fromRaw | 15.999ms | 16.813ms | 20.101ms | 24.556882ms | 3.862ms |
| CommonMarkSource.convertTo(OffsetSource) | 53.303ms | 57.552ms | 68.802ms | 73.211224ms | 14.161ms |
| CommonMarkRenderer.render | 45.427ms | 28.878ms | 90.374ms | 92.986452ms | 28.938ms |
| Round trip | 114.932ms | 106.452ms | 176.815ms | 184.183862ms | 43.939ms |
