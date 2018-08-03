CnNodeBuild(project: "atjson",
            nodeVersion: "nsolid-2.3.4-boron",
            npmVersion: "3") {
  sh "npm install"
  sh "./node_modules/.bin/lerna bootstrap --hoist"
  sh "./node_modules/.bin/lerna run build --parallel"
}
