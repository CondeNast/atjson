module.exports = {
  server: {
    command: 'parcel public/index.html --no-hmr',
    launchTimeout: 30000
  },
  launch: {
    dumpio: true,
    headless: false
  }
}
