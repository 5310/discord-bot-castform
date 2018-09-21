const { pipe, map, forEach } = require('callbag-basics')
const tap = require('callbag-tap')

require('./server')
const bot = require('./bot')

const aw = require('./aw')
const { aw2pogo, labelEmotes } = require('./pogo')
const { run, hour2meridian } = require('./utils')

const JSONDB = require('node-json-db')

run(async () => {
  
  // Await the bot
  const client = await bot.client
  
  // Setup all the sources and sinks
  Object.keys(aw.locations).forEach(key => {    
    // Get forecast and predictions
    const weathers$ = pipe(
      aw.source(aw.locations[key]),
      map(weathers => weathers.map(({epoch, querydate, queryhour, date, hour, ...forecast}) => ({ 
        epoch,
        querydate,
        queryhour,
        date,
        hour,
        forecast,
        prediction: aw2pogo(forecast)
      }))),
    )
    
    // Store forecast and predictions
    const weatherDb = new JSONDB(`weather_${key}`, true, true)
    forEach(weathers => {
      weatherDb.push(`${weathers[0].querydate}/${weathers[0].queryhour}`, weathers, true)
    })(weathers$)
    
    // Post predictions
    forEach(weathers => {
      const embed = {
        // title: `${aw.locations[key].name}`,
        footer: {
          text: `${
            ({'00': 'midnight', '08': 'morning', '16': 'afternoon'})[weathers[0].queryhour]
          } forecast, ${ weathers[0].querydate }`
        },
        fields: [{
          name: aw.locations[key].name, 
          value: '​', 
          inline: true
        }]
          .concat(weathers.slice(0, 8).map(({hour, prediction}) => {
            const superficials = Object.keys(prediction.superficial)
              .filter(k => prediction.superficial[k] && k != prediction.dominant)
              .map(k => labelEmotes[k])
            return {
              name: hour2meridian(parseInt(hour)), 
              value: `${ 
                labelEmotes[prediction.dominant] 
              }${ 
                superficials.length ? superficials.join('') : '' 
              }`, 
              inline: true
            }
          }))
      }
      // This is necessarily live, as users can set the channel anytime
      Object.keys(bot.config)
        .map(key => ({guild: client.guilds.get(key), channelId: bot.config[key].channel}))
        .filter(({guild}) => guild)
        .map(({guild, channelId}) => guild.channels.get(channelId))
        .filter(channel => channel)
        .forEach(channel => channel.send({embed}))
    })(weathers$)
  })
})
