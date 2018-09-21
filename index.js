const { pipe, map, forEach, merge, pump, share } = require('callbag-basics')
const tap = require('callbag-tap')
const timer = require('callbag-date-timer')
const of = require('callbag-of')

require('./server')
const bot = require('./bot')

const aw = require('./aw')
const pogo = require('./pogo')
const { run, hour2meridian } = require('./utils')


const HOURS = ['00', '08', '16']
const JSONDB = require('node-json-db')

run(async () => {  
  // Await the bot
  const client = await bot.client

  // Load locations to check
  const locations = new JSONDB('locations.json', true, true).getData('/')
  
  // Setup callbags
  Object.keys(locations).forEach(key => {
    
    // Get forecast and predictions
    const weathers$ = pipe(
      // of(0), //DEBUG:
      pipe(merge(...HOURS.map(hour => timer(new Date(`2018-01-01T${hour}:05${location.timezone}`), 24*60*60*1000))), pump),
      map(_ => locations[key]),
      aw.query,
      map(weathers => weathers.map(({epoch, querydate, queryhour, date, hour, ...forecast}) => ({ 
        epoch,
        querydate,
        queryhour,
        date,
        hour,
        forecast,
        prediction: pogo.aw2pogo(forecast)
      }))),
      share,
    )
    
    // Store forecast and predictions
    const weatherDb = new JSONDB(`weather_${key}`, true, true)
    forEach(weathers => {
      weatherDb.push(`${weathers[0].querydate}/${weathers[0].queryhour}`, weathers, true)
    })(weathers$)
    
    // Post predictions
    forEach(weathers => {
      const embed = {
        // title: `${locations[key].name}`,
        footer: {
          text: `${
            ({'00': 'midnight', '08': 'morning', '16': 'afternoon'})[weathers[0].queryhour]
          } forecast, ${ weathers[0].querydate }`
        },
        fields: [{
          name: locations[key].name, 
          value: '​', 
          inline: true
        }]
          .concat(weathers.slice(0, 8).map(({hour, prediction}) => {
            const superficials = Object.keys(prediction.superficial)
              .filter(k => prediction.superficial[k] && k != prediction.dominant)
              .map(k => pogo.labelEmotes[k])
            return {
              name: hour2meridian(parseInt(hour)), 
              value: `${ 
                pogo.labelEmotes[prediction.dominant] 
              }${ 
                superficials.length ? superficials.join('') : '' 
              }`, 
              inline: true
            }
          }))
      }
      console.log(embed)
      bot.send({embed})
    })(weathers$)
  })
})
