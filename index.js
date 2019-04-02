const { pipe, map, forEach, merge, share } = require('callbag-basics')
const tap = require('callbag-tap')
const timer = require('callbag-date-timer')
const of = require('callbag-of')

require('./server')
const bot = require('./bot')

const aw = require('./aw')
const pogo = require('./pogo')
const model = require('./model-th0rnleaf')

const { run, hour2meridian } = require('./utils')

const JSONDB = require('node-json-db')

//invite link
//https://discordapp.com/oauth2/authorize?client_id=543499399989559306&scope=bot&permissions=19520

//https://www.reddit.com/r/TheSilphRoad/comments/amb4ki/predicting_ingame_weather_yes_you_can/
// pull times at 5 am, 1 am, or midnight...

function clearList(channel){
  let messagecount = parseInt(100);      //amoutn of messages to check (set to high ???)
  channel.fetchMessages({limit: messagecount}).then(messages => { //get ^ amount of messages
    messages.filter(messChk => { //filter messages
      if (messChk.author.id == "543499399989559306"){ //filter by if from bot 
          messChk.delete(); //if from bot. do thing
      }

    });
  }); 
}

const PULLHOUR = 8 // NOTE: apparently pull-hour/query-hour-offset changes every now and then without much rhyme or reason :|
const HOURS = 
      //new Array(24).fill().map((_, i) => `${i}`.padStart(2, '0')) || // Debug: ALL DAY, EVERY DAY
      new Array(3).fill(0+PULLHOUR).map((v, i) => new String((24+v+i*8)%24).padStart(2, '0'))

run(async () => {  
  // Await the bot
  const client = await bot.client

  // Load locations to check
  const locations = new JSONDB('locations', true, true).getData('/')

  //load filters by server
  const servers = new JSONDB('servers', true, true).getData('/')
  
  // setup filters

  
  // Setup callbags
  Object.keys(locations)
    //.filter(location => ['depere'].includes(location)) // Debug: Quickly filter locations when testing
    .forEach(key => {
      const location = locations[key]

      // Get forecast and predictions
      const weathers$ = pipe(
        merge(
          ...HOURS.map(hour => timer(new Date(`2019-01-01T${hour}:06${location.timezone}`), 24*60*60*1000)),
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
          prediction: model(forecast)
        }))),
        // tap(console.log), // DEBUG:
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
            text: `${weathers[0].querydate}T${weathers[0].queryhour}${location.timezone}`
          },
          fields: [{
            name: locations[key].name, 
            value: '​', 
            inline: true
          }]
            .concat(weathers.slice(0, 8).map(({hour, prediction}) => { // DEBUG: Next 8 hours
              const superficials = Object.keys(prediction.superficial)
                .filter(k => prediction.superficial[k] && k != prediction.dominant)
                .map(k => pogo.labelEmoteMap[k])
              return {
                name: hour2meridian(parseInt(hour)), 
                value: `${ 
                  pogo.labelEmoteMap[prediction.dominant] 
                }${ 
                  superficials.length ? superficials.join('') : '' 
                }`, 
                inline: true
              }
            }))
        }
        console.log(embed)
        
        Object.keys(servers)
          .forEach(key2 => {
            const server = servers[key2]
            //clearList(client.channels.get(server.channel))

            //setup filter
            if(server.filter.includes(key)){
              client.channels.get(server.channel).send({embed})
            }
            //end by server loop
        })
        //bot.send({embed})
      })(weathers$)
    })

  })
