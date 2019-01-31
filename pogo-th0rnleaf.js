// NOTE: this model comes from /u/th0rnleaf
// https://old.reddit.com/r/TheSilphRoad/comments/aks0k7/weather_gone_germany/ef7jnwu/
// https://docs.google.com/spreadsheets/d/1v51qbI1egh6eBTk-NTaRy3Qlx2Y2v9kDYqmvHlmntJE/edit#gid=0 

const labelEmotes = {
  clear:        '☀',
  partlycloudy: '⛅',
  cloudy:       '☁',
  rain:         '☔',
  snow:         '⛄',
  fog:          '🌫',
  windy:        '🎐',
  alert:        '⚠',
  none:         '🚫',
}

const labelmap = ({
  sunny:                  { dominant: 'clear',        superficial: {} },
  clear:                  { dominant: 'clear',        superficial: {} },
  mostlysunny:            { dominant: 'clear',        superficial: {} },
  mostlyclear:            { dominant: 'clear',        superficial: {} },
  partlysunny:            { dominant: 'partlycloudy', superficial: {} },
  partlysunnywshowers:    { dominant: 'partlycloudy', superficial: { rain: true } },
  partlysunnywtstorms:    { dominant: 'partlycloudy', superficial: { rain: true } },
  partlysunnywflurries:   { dominant: 'partlycloudy', superficial: { snow: true } },
  partlycloudy:           { dominant: 'partlycloudy', superficial: {} },
  partlycloudywshowers:   { dominant: 'partlycloudy', superficial: { rain: true } },
  partlycloudywtstorms:	  { dominant: 'partlycloudy', superficial: { rain: true } },
  intermittentclouds:     { dominant: 'partlycloudy', superficial: {} },
  mostlycloudy:           { dominant: 'cloudy',       superficial: {} },
  mostlycloudywshowers:   { dominant: 'cloudy',       superficial: { rain: true } },
  mostlycloudywtstorms:   { dominant: 'cloudy',       superficial: { rain: true } },
  mostlycloudywflurries:  { dominant: 'cloudy',       superficial: { snow: true } },
  cloudy:                 { dominant: 'cloudy',       superficial: {} },
  hazysunshine:           { dominant: 'cloudy',       superficial: {} },
  hazymoonlight:          { dominant: 'cloudy',       superficial: {} },
  dreary:                 { dominant: 'cloudy',       superficial: {} },
  showers:                { dominant: 'rain',         superficial: {} },
  rain:                   { dominant: 'rain',         superficial: {} },
  tstorms:                { dominant: 'rain',         superficial: {} },
  thunderstorms:          { dominant: 'rain',         superficial: {} },
  freezingrain:           { dominant: 'rain',         superficial: {} },
  fog:                    { dominant: 'fog',          superficial: {} },
  rainandsnow:            { dominant: 'snow',         superficial: {} },
  flurries:               { dominant: 'snow',         superficial: {} },
  snow:                   { dominant: 'snow',         superficial: {} },
  windy:                  { dominant: 'windy',        superficial: {} },
})

const thresholds = {
  dominant: {
    wind: 24.1,
    gust: 31.1,
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
  const weather = labelmap[label]
  const windyable = [weather.dominant, ...Object.keys(weather.superficial)].some(label => ['rain', 'snow', 'fog'].includes(label))
  const windy = wind >= thresholds.dominant.wind || gust >= thresholds.dominant.gust
  return {
    dominant: windyable && windy ? 'windy' : weather.dominant,
    superficial: {
      ...weather.superficial,
      windy: windy || wind >= thresholds.superficial.wind
    },
  }
}

module.exports = {
  labelmap,
  labelEmotes,
  thresholds,
  aw2pogo
}