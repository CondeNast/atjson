# ⏱ Performance

The metrics below are taken from the CommonMark specification tests. These are _not_ realistic examples of what you'd find out in the world, but it is a fairly large dataset that runs the code through its paces.

This benchmark was taken on Linux 4.15 on x64 with 2 cores of Intel(R) Xeon(R) CPU @ 2.30GHz.

| Function                                 | Mean    | Median  | 95th Percentile | Maximum     | Standard Deviation |
| ---------------------------------------- | ------- | ------- | --------------- | ----------- | ------------------ |
| CommonMarkSource.fromRaw                 | 0.519ms | 0.441ms | 0.668ms         | 17.366959ms | 0.413ms            |
| CommonMarkSource.convertTo(OffsetSource) | 0.329ms | 0.263ms | 0.651ms         | 18.963138ms | 0.346ms            |
| CommonMarkRenderer.render                | 0.115ms | 0.096ms | 0.213ms         | 8.253514ms  | 0.120ms            |
| Round trip                               | 1.019ms | 0.862ms | 1.906ms         | 20.015846ms | 0.606ms            |

## 🔥 Slow real-life examples

The metrics below are taken from real articles written by Condé Nast editors / writers.

This benchmark was taken on Linux 4.15 on x64 with 2 cores of Intel(R) Xeon(R) CPU @ 2.30GHz.

| Function                                 | Mean      | Median   | 95th Percentile | Maximum      | Standard Deviation |
| ---------------------------------------- | --------- | -------- | --------------- | ------------ | ------------------ |
| CommonMarkSource.fromRaw                 | 15.253ms  | 14.560ms | 20.339ms        | 28.965387ms  | 4.404ms            |
| CommonMarkSource.convertTo(OffsetSource) | 50.502ms  | 53.683ms | 63.324ms        | 66.260717ms  | 12.187ms           |
| CommonMarkRenderer.render                | 43.071ms  | 26.425ms | 83.398ms        | 95.180577ms  | 29.000ms           |
| Round trip                               | 108.981ms | 95.380ms | 170.216ms       | 186.697165ms | 42.548ms           |
