# ⏱ Performance

The metrics below are taken from the CommonMark specification tests. These are _not_ realistic examples of what you'd find out in the world, but it is a fairly large dataset that runs the code through its paces.

This benchmark was taken on macOS High Sierra on x64 with 8 cores of Intel(R) Core(TM) i7-4870HQ CPU @ 2.50GHz.

| Function | Mean | Median | 95th Percentile | Standard Deviation |
|----------|------|--------|-----------------|--------------------|
| CommonMarkSource.fromRaw | 0.388ms | 0.338ms | 0.507ms | 0.236ms |
| CommonMarkSource.convertTo(OffsetSource) | 0.343ms | 0.280ms | 0.725ms | 0.269ms |
| CommonMarkRenderer.render | 0.245ms | 0.191ms | 0.568ms | 0.228ms |
| MarkdownIt.render | 0.029ms | 0.025ms | 0.047ms | 0.031ms |
| Round trip | 1.023ms | 0.868ms | 2.119ms | 0.546ms |
