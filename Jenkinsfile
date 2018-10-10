CnNodeBuild(project: "atjson",
            nodeVersion: "node-v8.12.0",
            npmVersion: "6.2.0") {
  sh "npm ci --unsafe-perm"
  sh "npx lerna run build"
}
