# ⏱ Performance

The metrics below are taken from the CommonMark specification tests. These are _not_ realistic examples of what you'd find out in the world, but it is a fairly large dataset that runs the code through its paces.

This benchmark was taken on Linux 4.4 on x64 with 2 cores of Intel(R) Xeon(R) CPU @ 2.30GHz.

| Function | Mean | Median | 95th Percentile | Standard Deviation |
|----------|------|--------|-----------------|--------------------|
| CommonMarkSource.fromRaw | 0.527ms | 0.441ms | 0.732ms | 0.447ms |
| CommonMarkSource.convertTo(OffsetSource) | 0.350ms | 0.276ms | 0.686ms | 0.381ms |
| CommonMarkRenderer.render | 0.121ms | 0.100ms | 0.223ms | 0.145ms |
| Round trip | 1.058ms | 0.885ms | 2.003ms | 0.670ms |


## 🔥 Slow real-life examples

The metrics below are taken from real articles written by Condé Nast editors / writers.

This benchmark was taken on Linux 4.4 on x64 with 2 cores of Intel(R) Xeon(R) CPU @ 2.30GHz.

| Function | Mean | Median | 95th Percentile | Standard Deviation |
|----------|------|--------|-----------------|--------------------|
| CommonMarkSource.fromRaw | 16.141ms | 16.250ms | 22.019ms | 4.110ms |
| CommonMarkSource.convertTo(OffsetSource) | 54.865ms | 59.801ms | 67.588ms | 13.472ms |
| CommonMarkRenderer.render | 61.727ms | 48.693ms | 94.411ms | 51.366ms |
| Round trip | 132.918ms | 126.297ms | 181.148ms | 64.280ms |
