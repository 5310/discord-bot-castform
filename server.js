const express = require('express')
const { objectFilter: filter } = require('./utils')
const JSONDB = require('node-json-db')

const app = express()

app.get('/', (request, response) => {
  response.sendStatus(200)
})

app.get('/locations', (request, response) => {
  const locations = new JSONDB('locations', true, true).getData('/')
  response.json(locations)
})
app.get('/weather/:location', (request, response) => {
  const weather = new JSONDB(`weather_${request.params.location}`, true, true).getData('/')
  response.json(weather)
})
app.get('/weather/:location/:year-:month-:day', (request, response) => {
  const { location, year, month, day } = request.params
  const weather = new JSONDB(`weather_${location}`, true, true).getData('/')
  response.json(filter(date => date.match(RegExp(`^${year || '....'}-${month || '..'}-${day || '..'}$`)), weather))
})

app.listen(process.env.PORT)
console.log('Keepalive server is running')
