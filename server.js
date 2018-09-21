const http = require('http')
const express = require('express')
const { utc2istString } = require('./utils')


const app = express()
app.get("/", (request, response) => {
  // console.log(`${utc2istString(new Date())}: Ping received`)
  response.sendStatus(200)
})
app.listen(process.env.PORT)
console.log('Keepalive server is running')