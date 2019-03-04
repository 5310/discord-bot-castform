// NOTE: this model comes from /u/th0rnleaf
// https://old.reddit.com/r/TheSilphRoad/comments/aks0k7/weather_gone_germany/ef7jnwu/
// https://docs.google.com/spreadsheets/d/1v51qbI1egh6eBTk-NTaRy3Qlx2Y2v9kDYqmvHlmntJE/edit#gid=0

const weatherMap = ({
  sunny: { dominant: 'clear', superficial: {}, windyable: true },
  clear: { dominant: 'clear', superficial: {}, windyable: true },
  mostlysunny: { dominant: 'clear', superficial: {}, windyable: true },
  mostlyclear: { dominant: 'clear', superficial: {}, windyable: true },
  partlysunny: { dominant: 'partlycloudy', superficial: {}, windyable: true },
  partlysunnywshowers: { dominant: 'partlycloudy', superficial: { rain: true } },
  partlysunnywtstorms: { dominant: 'partlycloudy', superficial: { rain: true } },
  partlysunnywflurries: { dominant: 'partlycloudy', superficial: { snow: true } },
  partlycloudy: { dominant: 'partlycloudy', superficial: {}, windyable: true },
  partlycloudywshowers: { dominant: 'partlycloudy', superficial: { rain: true } },
  partlycloudywtstorms: { dominant: 'partlycloudy', superficial: {}, windyable: true },
  intermittentclouds: { dominant: 'partlycloudy', superficial: {}, windyable: true },
  mostlycloudy: { dominant: 'cloudy', superficial: {}, windyable: true },
  mostlycloudywshowers: { dominant: 'cloudy', superficial: { rain: true } },
  mostlycloudywtstorms: { dominant: 'cloudy', superficial: { rain: true } },
  mostlycloudywflurries: { dominant: 'cloudy', superficial: { snow: true } },
  cloudy: { dominant: 'cloudy', superficial: {}, windyable: true },
  hazysunshine: { dominant: 'cloudy', superficial: {}, windyable: true },
  hazymoonlight: { dominant: 'cloudy', superficial: {}, windyable: true },
  dreary: { dominant: 'cloudy', superficial: {}, windyable: true },
  showers: { dominant: 'rain', superficial: {} },
  rain: { dominant: 'rain', superficial: {} },
  tstorms: { dominant: 'rain', superficial: {} },
  thunderstorms: { dominant: 'rain', superficial: {} },
  freezingrain: { dominant: 'rain', superficial: {} },
  fog: { dominant: 'fog', superficial: {} },
  rainandsnow: { dominant: 'snow', superficial: {} },
  flurries: { dominant: 'snow', superficial: {} },
  snow: { dominant: 'snow', superficial: {} },
  windy: { dominant: 'windy', superficial: {}, windyable: true },
})

const thresholds = {
  dominant: {
    wind: 24,
    gust: 35,
  },
  superficial: {
    // rain: 50,
    // snow: 50,
    wind: 16,
  },
}

const aw2pogo = ({
  label,
  wind,
  gust,
}) => {
  const weather = weatherMap[label]
  const windy = wind >= thresholds.dominant.wind || gust >= thresholds.dominant.gust
  const dominant = weather.windyable && windy ? 'windy' : weather.dominant
  return {
    dominant,
    superficial: {
      ...weather.superficial,
      windy: dominant !== 'windy' && (!weather.windyable && (windy || wind) >= thresholds.superficial.wind)
    },
  }
}

module.exports = aw2pogo
