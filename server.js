const express = require('express')
const JSONDB = require('node-json-db')

const app = express()

app.get('/', (request, response) => {
  response.sendStatus(200)
})

app.get('/locations', (request, response) => {
  const locations = new JSONDB('locations', true, true).getData('/')
  response.json(Object.keys(locations))
})

app.listen(process.env.PORT)
console.log('Keepalive server is running')
