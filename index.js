const { pipe, map, forEach, merge, share } = require('callbag-basics')
const tap = require('callbag-tap')
const timer = require('callbag-date-timer')
const of = require('callbag-of')

// require('./server')
// const bot = require('./bot')

const aw = require('./aw')
const pogo = require('./pogo')
const model = require('./model-th0rnleaf')

const { run, hour2meridian } = require('./utils')

const JSONDB = require('node-json-db')

const HOURS = new Array(24).fill().map((_, i) => `${i}`.padStart(2, '0'))

run(async () => {
  // Await the bot
  // await bot.client

  // Load locations to check
  const locationsDB = new JSONDB('locations', true, true).getData('/')

  // Setup callbags
  Object.keys(locationsDB)
    .filter(key => !locationsDB[key].disabled)
    .forEach(key => {
      const location = locationsDB[key]

      // Get AW forecasts
      const aw$ = pipe(
        merge(
          ...HOURS.map(hour => timer(new Date(`2018-01-01T${hour}:30${location.timezone}`), 24 * 60 * 60 * 1000)),
          of(0) // DEBUG: Triggers query at start even if it's not time
        ),
        map(_ => location),
        aw.query$,
        // tap(console.log), // DEBUG:,
        share,
      )

      // TODO: Save AW forecasts
      forEach(_ => console.log(_))(aw$)

      // TODO: Compose report from past AW forecasts

      // TODO: Send report
    })
})
