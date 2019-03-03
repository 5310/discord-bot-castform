const { pipe, map, fromPromise, flatten, filter } = require('callbag-basics')
const tap = require('callbag-tap')
const fetch = require('cross-fetch')
const { utc2istString } = require('./utils')

const API = location => `https://dataservice.accuweather.com/forecasts/v1/hourly/12hour/${location}?apikey=${process.env.AWKEY}&details=true&metric=true`
const query$ = location$ => pipe(
  location$,
  tap(location => console.log(`AccuWeather at ${location.name}`)),
  map(location => fromPromise(fetch(API(location.id)).then(res => res.json()))),
  flatten,
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
      querydate: now.slice(0, 10), // date of the api call
      queryhour: now.slice(11, 13), // hour of the api call
      date: datetime.slice(0, 10), // date of the forecast
      hour: datetime.slice(11, 13), // hour of the forecast
      label: label
        .replace(/[^\w!?]/g, '')
        .toLowerCase(), // aw label of the weather
      temp, // temperature in Celcius
      visib, // visibility in Km
      wind, // sustained wind speed in Km/h
      gust, // gust speed in Km/h
      cloud, // % of cloud cover
      precip, // % chance of any kind of precipitation
      rain, // % chance of rain
      snow, // % chance of snow
      humid, // relative humidity in %
      dew, // dew point in Celcius
      ceiling: ceiling / 1000, // loud ceiling height in Km
      light, // daylight in boolean
      uv, // uv index
    }))
  }),
  // tap(console.log) // DEBUG:
)

module.exports = {
  query$,
}
