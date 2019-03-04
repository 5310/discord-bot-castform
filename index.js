const { run } = require('./utils')

const JSONDB = require('node-json-db')

const { pipe, map, forEach, share } = require('callbag-basics')
const tap = require('callbag-tap')
const timer = require('callbag-date-timer')

const { flatten, range } = require('arare')

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

      const hour$ = share(timer(DateTime.fromObject({ hour: 0, zone: location.timezone }).toJSDate(), 10 * 1000))

      // forecasts
      pipe(
        hour$,
        map(_ => location),
        aw.query$,
        // tap(console.log), // DEBUG:
        forEach(weathers => {
          console.log('Saving AW prediction')
          const awDB = new JSONDB(`data/aw/${key}/${weathers[0].querydate}`, true, true)
          awDB.push(`/${weathers[0].queryhour}`, weathers, true)
        }),
      )

      // reports // TODO:
      pipe(
        hour$,
        // tap(console.log), // DEBUG:
        map(_ => DateTime.local().setZone(location.timezone)),
        map(now => range(0, 12, 1)
          .map(x => now.plus({ hours: x + 1 }).toISOTime().slice(0, 2)) // the next twelve hours
          .map(hour => ({ [hour]: // all past predictions of given hour
              pipe(
                [-1, 0]
                  .map(x => now.plus({ day: x }).toISODate())
                  .map(date =>
                    Object.values(new JSONDB(`data/aw/${key}/${date}`).getData('/'))
                      .map(weathers => weathers.filter(weather => weather.hour === hour))
                  ),
                flatten,
                flatten,
              )
                .map(weather => ({ [weather.queryhour]: model(weather) }))
                .reduce((a, x) => ({ ...a, ...x }), {}) // flatten object
          })).reduce((a, x) => ({ ...a, ...x }), {}) // flatten object
        ),
        forEach(console.log)
      )
    })
})
