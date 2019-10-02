departuresBuild(project: 'atjson') {
  if (env.BRANCH_NAME == "latest") {
    withNodeJs(version: 'node-v8.12.0', npmVersion: '6.2.0') {
      sh '''
        pushd website
        npm ci --unsafe-perm
        npm run build
        popd
      '''
    }

    s3Upload(
      awsAccount: 'cndigital',
      region: 'us-east-1',
      sourceDir: 'website/build',
      s3Path: 'cn-static-sites/atjson.condenast.io'
    )
  }
}
