departuresBuild(project: 'atjson') {
  if (env.BRANCH_NAME == "latest") {
    withNodeJs(version: 'node-v14.15.1', npmVersion: '6.14.5') {
      sh '''
        pushd website
        npm install
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
