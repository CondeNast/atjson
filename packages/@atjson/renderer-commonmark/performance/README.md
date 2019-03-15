# ⏱ Performance

The metrics below are taken from the CommonMark specification tests. These are _not_ realistic examples of what you'd find out in the world, but it is a fairly large dataset that runs the code through its paces.

This benchmark was taken on Linux 4.4 on x64 with 2 cores of Intel(R) Xeon(R) CPU @ 2.30GHz.

| Function | Mean | Median | 95th Percentile | Standard Deviation |
|----------|------|--------|-----------------|--------------------|
| CommonMarkSource.fromRaw | 0.529ms | 0.446ms | 0.729ms | 0.426ms |
| CommonMarkSource.convertTo(OffsetSource) | 0.462ms | 0.357ms | 0.943ms | 0.486ms |
| CommonMarkRenderer.render | 0.123ms | 0.103ms | 0.226ms | 0.132ms |
| Round trip | 1.174ms | 0.976ms | 2.544ms | 0.740ms |


## 🔥 Slow real-life examples

The metrics below are taken from real articles written by Condé Nast editors / writers.

This benchmark was taken on Linux 4.4 on x64 with 2 cores of Intel(R) Xeon(R) CPU @ 2.30GHz.

| Function | Mean | Median | 95th Percentile | Standard Deviation |
|----------|------|--------|-----------------|--------------------|
| CommonMarkSource.fromRaw | 15.838ms | 15.352ms | 21.029ms | 4.335ms |
| CommonMarkSource.convertTo(OffsetSource) | 82.657ms | 82.639ms | 92.944ms | 47.432ms |
| CommonMarkRenderer.render | 55.546ms | 50.028ms | 94.145ms | 27.963ms |
| Round trip | 154.220ms | 149.953ms | 202.141ms | 71.081ms |
