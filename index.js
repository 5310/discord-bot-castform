const { fill, filter, flatten, forEach, keys, map, range, reduce, values } = require('arare')
const { pipe } = require('callbag-basics')
const { flattenObj, run } = require('./utils')

const CB = {
  operate: require('callbag-operate'),
  subscribe: require('callbag-subscribe'),
  tap: require('callbag-tap'),
  timer: require('callbag-date-timer'),
  ...require('callbag-basics')
}

const JSONDB = require('node-json-db')

const { DateTime } = require('luxon')

const aw = require('./aw')
const defaultModel = require('./model-th0rnleaf')
const pogo = require('./pogo')

require('./server')
const bot = require('./bot')

run(async () => {
  // Await the bot
  await bot.client

  console.log('Castform is running')

  // Load locations to check
  const locationsDB = new JSONDB('locations').getData('/')

  // Setup callbags
  pipe(
    locationsDB,
    keys,
    filter(key => !locationsDB[key].disabled),
    forEach(key => {
      const location = locationsDB[key]
      const model = location.model ? require(`./model-${location.model}`) : defaultModel

      // forecasts
      const forecast = CB.operate(
        CB.map(_ => location),
        aw.query,
        // CB.tap(console.debug), // DEBUG:
        CB.tap(weathers => {
          console.info({
            timestamp: DateTime.local().setZone(location.timezone).toISO(),
            info: 'predictions',
            location: key,
            payload: weathers.map(({ date, hour, label }) => ({ [`${date}T${hour}`]: label })).reduce(...flattenObj),
          })
          const awDB = new JSONDB(`data/aw/${key}/${weathers[0].querydate}`, true, true)
          awDB.push(`/${weathers[0].queryhour}`, weathers, true)
          if (location.model) {
            const modelDB = new JSONDB(`data/model/${key}/${weathers[0].querydate}`, true, true)
            modelDB.push(`/${weathers[0].queryhour}`, weathers.map(weather => ({
              querydate: weather.querydate,
              queryhour: weather.queryhour,
              date: weather.date,
              hour: weather.hour,
              model: model(weather)
            })), true)
          }
        }),
      )

      // reports
      const report = CB.operate(
        CB.map(_ => DateTime.local().setZone(location.timezone).startOf('hour')),
        CB.map(now => pipe(
          [-1, 0],
          map(x => now.plus({ day: x }).toISODate()),
          map(dt => values(new JSONDB(`data/aw/${key}/${dt}`).getData('/'))),
          flatten,
          reduce(
            (predictions, weather) => {
              const queryhour = DateTime.fromISO(`${weather.querydate}T${weather.queryhour}`, { zone: location.timezone })
              const hour = DateTime.fromISO(`${weather.date}T${weather.hour}`, { zone: location.timezone })
              const toForecast = hour.diff(now).as('hour') - 1
              const fromQuery = now.diff(queryhour).as('hour')
              if (toForecast >= 0 && toForecast < 12) {
                predictions[toForecast].forecasts[fromQuery] = {
                  queryhour,
                  weather: model(weather)
                }
              }
              return predictions
            },
            range(0, 12, 1).map(x => ({ hour: now.plus({ hour: x + 1 }), forecasts: fill(12 - x, undefined) }))
          )
        )),
        // CB.tap(console.debug), // DEBUG:
        CB.map(predictions => {
          const now = DateTime.local().setZone(location.timezone).startOf('hour')
          const clocks = '🕛 🕐 🕑 🕒 🕓 🕔 🕕 🕖 🕗 🕘 🕙 🕚'.split(' ')
          const report = [
            `**${location.name}** \`${now.toISODate()}T${now.toISOTime().slice(0, 2)}\``,
            `       ${range(0, 12, 1).map(x => now.minus({ hours: x }).hour % 12).map(hour => clocks[hour]).join('')}`,
            ...predictions
              .map(prediction => `\`${prediction.hour.toISOTime().slice(0, 2)}\` ${
                prediction.forecasts
                  .map(forecast => pogo.labelEmoteMap[forecast ? forecast.weather.dominant : 'none'])
                  .join('')
              }`),
            '—'
          ]
          return report
        }),
        CB.tap(report => {
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
        CB.timer(DateTime.fromObject({ hour: 0, minute: location.minute || 0, zone: location.timezone }).toJSDate(), 60 * 60 * 1000),
        // CB.timer(DateTime.local().plus({ seconds: 5 }).toJSDate(), 60 * 60 * 1000), // DEBUG:
        forecast,
        report,
        CB.subscribe({
          complete: () => console.log('done'),
          error: console.error
        })
      )
    })
  )
})
