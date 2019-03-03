const { run, hour2meridian } = require('./utils')

const JSONDB = require('node-json-db')

const { pipe, map, forEach, merge } = require('callbag-basics')
const tap = require('callbag-tap')
const timer = require('callbag-date-timer')
const of = require('callbag-of')

const { flatten, zipObj } = require('arare')

const aw = require('./aw')
const pogo = require('./pogo')
const model = require('./model-th0rnleaf')

// require('./server')
// const bot = require('./bot')

const { DateTime } = require('luxon')

run(async () => {
  // Await the bot
  // await bot.client

  // Load locations to check
  const locationsDB = new JSONDB('locations').getData('/')

  // Setup callbags
  Object.keys(locationsDB)
    .filter(key => !locationsDB[key].disabled)
    .forEach(key => {
      const location = locationsDB[key]

      const hour$ = merge(
        timer(DateTime.fromObject({ hour: 0, zone: location.timezone }).toJSDate(), 60 * 60 * 1000),
        of(0) // DEBUG: Triggers query at start even if it's not time
      )

      // forecasts
      pipe(
        hour$,
        map(_ => location),
        aw.query$,
        tap(console.log), // DEBUG:
        forEach(weathers => {
          const awDB = new JSONDB(`data/aw/${key}/${weathers[0].querydate}`, true, true)
          awDB.push(`/${weathers[0].queryhour}`, weathers, true)
        }),
      )

      // reports // TODO:
      pipe(
        hour$,
        map(_ => {
          const now = DateTime.local().setZone(location.timezone)
          return {
            yesterday: now.minus({ day: 1 }).toISODate(),
            today: now.toISODate(),
            hour: now.toISOTime().slice(0, 2)
          }
        }),
        tap(console.log), // DEBUG:
        forEach(({ yesterday, today, hour }) => {
          const aw = pipe(
            [yesterday, today]
              .map(date =>
                Object.values(new JSONDB(`data/aw/${key}_${date}`).getData('/'))
                  .map(weathers => weathers.filter(weather => weather.hour === hour))
              ),
            flatten,
            flatten,
          ).map(weather => ({ hour: weather.queryhour, ...model(weather) }))
          console.log(aw)
        }),
      )
    })
})
