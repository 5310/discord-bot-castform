const { run, flattenObj } = require('./utils')

const JSONDB = require('node-json-db')

const { pipe, map, share } = require('callbag-basics')
const operate = require('callbag-operate')
const subscribe = require('callbag-subscribe')
const tap = require('callbag-tap')
const timer = require('callbag-date-timer')

const { flatten, range } = require('arare')

const aw = require('./aw')
const model = require('./model-th0rnleaf')
const pogo = require('./pogo')

// require('./server')
const bot = require('./bot')

const { DateTime } = require('luxon')

run(async () => {
  // Await the bot
  await bot.client

  // Load locations to check
  const locationsDB = new JSONDB('locations').getData('/')

  // Setup callbags
  Object.keys(locationsDB)
    .filter(key => !locationsDB[key].disabled)
    .forEach(key => {
      const location = locationsDB[key]

      const hour$ = share(timer(DateTime.fromObject({ hour: 0, zone: location.timezone }).toJSDate(), 60 * 60 * 1000))

      // forecasts
      const forecast = operate(
        map(_ => location),
        aw.query,
        // tap(console.debug),
        tap(weathers => {
          console.info({
            timestamp: DateTime.local().setZone(location.timezone).toISO(),
            info: 'predictions',
            location: key,
            payload: weathers
              .map(({ date, hour, label }) => ({ [`${date}T${hour}`]: label }))
              .reduce(...flattenObj)
          })
          const awDB = new JSONDB(`data/aw/${key}/${weathers[0].querydate}`, true, true)
          awDB.push(`/${weathers[0].queryhour}`, weathers, true)
        }),
      )

      // reports
      const report = operate(
        map(_ => DateTime.local().setZone(location.timezone)),
        map(now => range(0, 12, 1) // get past predictions of next twelve hours
          .map(x => now.plus({ hours: x + 1 }).toISOTime().slice(0, 2)) // the next twelve hours
          .map(hour => ({ [hour]: // get past predictions of given hour
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
                .reduce(...flattenObj)
          })).reduce(...flattenObj)
        ),
        // tap(console.debug),
        map(predictions => {
          const now = DateTime.local().setZone(location.timezone).startOf('hour')
          // const clocks = '🕧 🕜 🕝 🕟 🕟 🕠 🕡 🕢 🕣 🕤 🕥 🕦'.split(' ')
          const clocks = '🕛 🕐 🕑 🕒 🕓 🕔 🕕 🕖 🕗 🕘 🕙 🕚'.split(' ')
          const report = [
            `**${location.name}** ${now.toISODate()}T${now.toISOTime().slice(0, 2)}`,
            '',
            '       ' + range(0, 12, 1).map(x => now.minus({ hours: x }).hour % 12).map(hour => clocks[hour]).join(''),
            '',
            ...Object.keys(predictions)
              .map((hour, i) => {
                const labels = range(0, 12 - i, 1).map(x => now.minus({ hours: x }).toISOTime().slice(0, 2))
                  .map(queryhour => pogo.labelEmoteMap[predictions[hour][queryhour] ? predictions[hour][queryhour].dominant : 'none'])
                  .join('')
                return `\`${hour}\` ${labels}`
              }),
            '·'
          ]
          return report
        }),
        tap(report => {
          console.info({
            timestamp: DateTime.local().setZone(location.timezone).toISO(),
            info: 'report',
            location: key,
            payload: report
          })
          bot.send(report.join('\n'))
        }),
      )

      // run
      pipe(
        hour$,
        forecast,
        report,
        subscribe({
          complete: () => console.log('done'),
          error: console.error
        })
      )
    })
})
