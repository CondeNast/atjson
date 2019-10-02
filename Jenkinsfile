departuresBuild(project: 'atjson') {
  withNodeJs(version: 'node-v8.12.0', npmVersion: '6.2.0') {
    sh 'cd website'
    sh 'npm ci; npm run build'
  }

  if (env.BRANCH_NAME == "latest") {
    s3Upload(
      awsAccount: 'cndigital',
      region: 'us-east-1',
      sourceDir: 'website/build',
      s3Path: 'cn-static-sites/atjson.condenast.io'
    )
  }
}
