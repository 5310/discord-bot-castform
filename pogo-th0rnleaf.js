// NOTE: this model comes from /u/th0rnleaf
// https://old.reddit.com/r/TheSilphRoad/comments/aks0k7/weather_gone_germany/ef7jnwu/
// https://docs.google.com/spreadsheets/d/1v51qbI1egh6eBTk-NTaRy3Qlx2Y2v9kDYqmvHlmntJE/edit#gid=0 

const labelmap = ({
  sunny:                  'clear',
  clear:                  'clear',
  mostlysunny:            'clear',
  mostlyclear:            'clear',
  partlysunny:            'partlycloudy',
  partlysunnywshowers:    'partlycloudy',
  partlysunnywtstorms:    'partlycloudy',
  partlysunnywflurries:   'partlycloudy',
  partlycloudy:           'partlycloudy',
  partlycloudywshowers:   'partlycloudy',
  partlycloudywtstorms:	  'partlycloudy',
  intermittentclouds:     'partlycloudy',
  mostlycloudy:           'cloudy',
  mostlycloudywshowers:   'cloudy',
  mostlycloudywtstorms:   'cloudy',
  mostlycloudywflurries:  'cloudy',
  cloudy:                 'cloudy',
  hazysunshine:           'cloudy',
  hazymoonlight:          'cloudy',
  dreary:                 'cloudy',
  showers:                'rain',
  rain:                   'rain',
  tstorms:                'rain',
  thunderstorms:          'rain',
  freezingrain:           'rain',
  fog:                    'fog',
  rainandsnow:            'snow',
  flurries:               'snow',
  snow:                   'snow',
  windy:                  'windy',
}) 

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

const windyList = [
  'clear',
  'cloudy',
  'dreary',
  'hazysunshine',
  'hazymoonlight',
  'intermittentclouds',
  'mostlyclear',
  'mostlycloudy',
  'mostlysunny',
  'partlycloudy',
  'partlysunny',
  'sunny',
  'windy',  
]

const thresholds = {
  dominant: {
    wind: 24.1,
    gust: 31.1,
  },
  superficial: {
    rain: 50,
    snow: 50,
    wind: 16,
  },
}

const aw2pogo = ({
  label,
  wind, 
  gust,
}) => {
  const boost = labelmap[label]
  const windyable = windyList.includes(label)
  const windy = wind >= thresholds.dominant.wind || gust >= thresholds.dominant.gust
  return {
    dominant: windyable && windy ? 'windy' : boost,
    superficial: {}, // NOTE: Skipping for now
  }
}

module.exports = {
  labelmap,
  labelEmotes,
  thresholds,
  aw2pogo
}