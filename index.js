const { pipe, map, forEach, merge, share } = require('callbag-basics')
const tap = require('callbag-tap')
const timer = require('callbag-date-timer')
const of = require('callbag-of')

require('./server')
const bot = require('./bot')

const aw = require('./aw')
const pogo = require('./pogo-th0rnleaf')
const { run, hour2meridian } = require('./utils')

const FORECASTOFFSET = 0
const HOURS = new Array(3).fill(0-1).map((v, i) => new String((24+v+i*8)%24).padStart(2, '0')) // DEBUG: for the off-DST months it started at 0
// const HOURS = new Array(24).fill().map((_, i) => `${i}`.padStart(2, '0')) // Debug: ALL DAY, EVERY DAY
const JSONDB = require('node-json-db')

run(async () => {  
  // Await the bot
  const client = await bot.client

  // Load locations to check
  const locations = new JSONDB('locations', true, true).getData('/')
  
  // Setup callbags
  Object.keys(locations).forEach(key => {
    const location = locations[key]
    
    // Get forecast and predictions
    const weathers$ = pipe(
      merge(
        ...HOURS.map(hour => timer(new Date(`2018-01-01T${hour}:05${location.timezone}`), 24*60*60*1000)),
        // of(0) //DEBUG: Triggers query at start even if it's not time
      ),
      map(_ => location),
      aw.query$,
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
      weatherDb.push(`/${weathers[0].querydate}/${weathers[0].queryhour}`, weathers, true)
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
          .concat(weathers.slice(...[0, 8].map(x => x + FORECASTOFFSET)).map(({hour, prediction}) => { // DEBUG: Next 8 hours
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
