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
}) // https://i.imgur.com/LgkxoJx.png

const thresholds = {
  dominant: {
    'rain': 60,
    'snow': 60,
    'wind': 55,
  },
  superficial: {
    'rain': 50,
    'snow': 50,
    'wind': 16,
  },
}

const aw2pogo = ({
  label,
  wind, 
  gust,
  precip,
  snow,
}) => ({
  dominant: 
    ['rain', 'snow'].includes(labelmap[label]) ? labelmap[label] :
    snow >= thresholds.dominant.snow ? 'snow' : 
    precip >= thresholds.dominant.rain ? 'rain' :
    label.search('wshowers') >= 0 ? labelmap[label] : 
    wind + gust >= thresholds.dominant.wind ? 'windy' : // DEBUG: This was our old wind model
    labelmap[label],
  superficial: {
    'snow': snow >= thresholds.superficial.snow,
    'rain': precip >= thresholds.superficial.rain,
    'windy': wind >= thresholds.superficial.wind
  }
})
//NOTE: Apparently AW 'w/ showers' overrides this entirely: 
// https://www.reddit.com/r/TheSilphRoad/comments/9uoz3r/the_usual_requirement_for_wind_seems_to_have/e95x731/

module.exports = {
  labelmap,
  labelEmotes,
  thresholds,
  aw2pogo
}