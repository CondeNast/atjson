# ⏱ Performance

The metrics below are taken from the CommonMark specification tests. These are _not_ realistic examples of what you'd find out in the world, but it is a fairly large dataset that runs the code through its paces.

This benchmark was taken on Linux 4.15 on x64 with 2 cores of Intel(R) Xeon(R) CPU @ 2.30GHz.

| Function                                 | Mean    | Median  | 95th Percentile | Maximum     | Standard Deviation |
| ---------------------------------------- | ------- | ------- | --------------- | ----------- | ------------------ |
| CommonMarkSource.fromRaw                 | 0.534ms | 0.452ms | 0.679ms         | 14.500851ms | 0.440ms            |
| CommonMarkSource.convertTo(OffsetSource) | 0.346ms | 0.275ms | 0.683ms         | 30.790797ms | 0.381ms            |
| CommonMarkRenderer.render                | 0.122ms | 0.100ms | 0.229ms         | 9.148015ms  | 0.138ms            |
| Round trip                               | 1.060ms | 0.892ms | 1.996ms         | 33.880747ms | 0.659ms            |

## 🔥 Slow real-life examples

The metrics below are taken from real articles written by Condé Nast editors / writers.
This benchmark was taken on Linux 4.15 on x64 with 2 cores of Intel(R) Xeon(R) CPU @ 2.30GHz.

| Function                                 | Mean      | Median    | 95th Percentile | Maximum     | Standard Deviation |
| ---------------------------------------- | --------- | --------- | --------------- | ----------- | ------------------ |
| CommonMarkSource.fromRaw                 | 16.651ms  | 17.249ms  | 21.922ms        | 25.410353ms | 4.310ms            |
| CommonMarkSource.convertTo(OffsetSource) | 55.546ms  | 59.412ms  | 70.075ms        | 70.838805ms | 13.071ms           |
| CommonMarkRenderer.render                | 142.241ms | 74.734ms  | 264.477ms       | 489.62111ms | 106.671ms          |
| Round trip                               | 214.641ms | 150.147ms | 356.532ms       | 577.1695ms  | 117.661ms          |
