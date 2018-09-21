const fetch = require('cross-fetch')
const { merge, map, flatten, interval, fromPromise, pipe, share, filter, forEach } = require('callbag-basics')
const of = require('callbag-of')
const timer = require('callbag-date-timer')
const pump = require('callbag-pump')
const tap = require('callbag-tap')
const flattenIter = require('callbag-flatten-iter')

const { utc2istString } = require('./utils')


const AWKEY = process.env.AWKEY
const API = location => `https://dataservice.accuweather.com/forecasts/v1/hourly/12hour/${location}?apikey=${AWKEY}&details=true&metric=true`
const LOCATION = {
  // howrah: { // somehow, this area code gets forecast weather for the query-hour, despite being a copy of Kolkata!
  //   name: 'Howrah',
  //   id: '3318435',
  //   timezone: '+05:30',
  // },
  kolkata: {
    name: 'Kolkata',
    id: '206690',
    timezone: '+05:30',
  },
  saltlake: {
    name: 'Saltlake',
    id: '3318389',
    timezone: '+05:30',
  },
}
const HOURS = ['00', '08', '16']

exports.locations = LOCATION
exports.hours = HOURS

exports.source = location => pipe(
  pipe(merge(...HOURS.map(hour => timer(new Date(`2018-01-01T${hour}:05${location.timezone}`), 24*60*60*1000))), pump),
  // of(1), pump, //DEBUG:
  tap(_ => console.log(`${new Date()}: Queried AccuWeather at ${location.name}`)),
  map(() => fromPromise(fetch(API(location.id)).then(res => res.json()))), flatten,
  filter(Array.isArray),
  map(forecast => {    
    const now = utc2istString(new Date())
    return forecast.map(({
      EpochDateTime: epoch,
      DateTime: datetime,
      IconPhrase: label, 
      Temperature: { Value: temp },
      Visibility: { Value: visib },
      Wind: { Speed: { Value: wind } },
      WindGust: { Speed: { Value: gust } },
      CloudCover: cloud,
      PrecipitationProbability: precip,
      RainProbability: rain,
      SnowProbability: snow,
      RelativeHumidity: humid,
      DewPoint: { Value: dew },
      Ceiling: { Value: ceiling },
      IsDaylight: light,
      UVIndex: uv,
    }) => ({
      epoch,
      querydate: now.slice(0, 10), // date of the api call, IST
      queryhour: now.slice(11, 13),// hour of the api call, IST
      date: datetime.slice(0, 10), // date of the forecast, IST
      hour: datetime.slice(11, 13),// hour of the forecast, IST
      label: label
        .replace(/[^\w!?]/g,'')
        .toLowerCase(),            // aw label of the weather
      temp,                        // temperature in Celcius
      visib,                       // visibility in Km
      wind,                        // sustained wind speed in Km/h
      gust,                        // gust speed in Km/h
      cloud,                       // % of cloud cover
      precip,                      // % chance of any kind of precipitation
      rain,                        // % chance of rain
      snow,                        // % chance of snow
      humid,                       // relative humidity in %
      dew,                         // dew point in Celcius
      ceiling: ceiling / 1000,     // loud ceiling height in Km
      light,                       // daylight in boolean
      uv,                          // uv index
    }))
  }),
  share,
)
