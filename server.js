const express = require('express')
const JSONDB = require('node-json-db')

const app = express()

app.get('/', (request, response) => {
  response.sendStatus(200)
})

app.listen(process.env.PORT)
console.log('Keepalive server is running')
