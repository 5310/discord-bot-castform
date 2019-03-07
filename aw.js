const { pipe, map, fromPromise, flatten, filter } = require('callbag-basics')
const tap = require('callbag-tap') // eslint-disable-line no-unused-vars
const fetch = require('cross-fetch')
const { DateTime } = require('luxon')

const API = location => `https://dataservice.accuweather.com/forecasts/v1/hourly/12hour/${location.id}?apikey=${location.key}&details=true&metric=true`

const query = location$ => pipe(
  location$,
  // tap(location => console.log(`AccuWeather at ${location.name}`, API(location))),
  map(location => fromPromise(fetch(API(location)).then(res => res.json()).then(forecast => ({ location, forecast })))),
  flatten,
  filter(payload => Array.isArray(payload.forecast)),
  // tap(console.debug), // DEBUG:
  map(payload => {
    const { location, forecast } = payload
    console.log(location)
    const now = DateTime.local().setZone(location.timezone)
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
      querydate: now.toISODate(), // date of the api call
      queryhour: now.toISOTime().slice(0, 2), // hour of the api call
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
  // tap(console.debug), // DEBUG:
)

module.exports = {
  query,
}
