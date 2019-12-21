const {
  fill,
  filter,
  flatten,
  forEach,
  keys,
  map,
  range,
  reduce,
  values
} = require('arare')
const {
  pipe
} = require('callbag-basics')
const {
  flattenObj,
  run
} = require('./utils')

const CB = {
  operate: require('callbag-operate'),
  subscribe: require('callbag-subscribe'),
  tap: require('callbag-tap'),
  timer: require('callbag-date-timer'),
  ...require('callbag-basics')
}

const JSONDB = require('node-json-db')

const {
  DateTime
} = require('luxon')

const aw = require('./aw')
const defaultModel = require('./model-ajstewart')
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
      )

      // reports
      const report = CB.operate(
        CB.map(weathers => {
          const now = DateTime.local().setZone(location.timezone).startOf('hour')
          const report = [
            `**${location.name}** \`${now.toISODate()}T${now.toISOTime().slice(0, 2)}\``,
            weathers.slice(0, 8).map(({hour}) => `\`${hour}\``).join('  '),
            weathers.slice(0, 8)
              .map(model)
              .map(forecast => pogo.labelEmoteMap[forecast ? forecast.dominant : 'none'])
              .join('  ')
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
        CB.timer(DateTime.fromObject({
          hour: 5,
          minute: location.minute || 0,
          zone: location.timezone
        }).toJSDate(), 8 * 60 * 60 * 1000),
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
