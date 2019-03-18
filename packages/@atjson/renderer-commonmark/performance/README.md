# ⏱ Performance

The metrics below are taken from the CommonMark specification tests. These are _not_ realistic examples of what you'd find out in the world, but it is a fairly large dataset that runs the code through its paces.

This benchmark was taken on Linux 4.4 on x64 with 2 cores of Intel(R) Xeon(R) CPU @ 2.50GHz.

| Function | Mean | Median | 95th Percentile | Maximum | Standard Deviation |
|----------|------|--------|-----------------|---------|--------------------|
| CommonMarkSource.fromRaw | 0.553ms | 0.455ms | 0.761ms | 14.403093ms | 0.498ms |
| CommonMarkSource.convertTo(OffsetSource) | 0.372ms | 0.289ms | 0.727ms | 12.897888ms | 0.427ms |
| CommonMarkRenderer.render | 0.124ms | 0.102ms | 0.233ms | 14.365726ms | 0.160ms |
| Round trip | 1.110ms | 0.916ms | 2.092ms | 15.745058ms | 0.742ms |

## 🔥 Slow real-life examples

The metrics below are taken from real articles written by Condé Nast editors / writers.
This benchmark was taken on Linux 4.4 on x64 with 2 cores of Intel(R) Xeon(R) CPU @ 2.50GHz.

| Function | Mean | Median | 95th Percentile | Maximum | Standard Deviation |
|----------|------|--------|-----------------|---------|--------------------|
| CommonMarkSource.fromRaw | 18.574ms | 17.502ms | 26.469ms | 29.002717ms | 5.269ms |
| CommonMarkSource.convertTo(OffsetSource) | 73.971ms | 71.398ms | 84.026ms | 342.511906ms | 52.406ms |
| CommonMarkRenderer.render | 61.822ms | 56.030ms | 103.968ms | 113.207644ms | 30.290ms |
| Round trip | 154.625ms | 146.649ms | 213.088ms | 428.68274ms | 71.121ms |
