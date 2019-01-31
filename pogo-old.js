const labelmap = ({
  'sunny':                  'clear',
  'clear':                  'clear',
  'mostlysunny':            'clear',
  'mostlyclear':            'clear',
  'partlysunny':            'partlycloudy',
  'partlycloudy':           'partlycloudy',
  'intermittentclouds':     'partlycloudy',
  'mostlycloudy':           'cloudy',
  'cloudy':                 'cloudy',
  'partlysunnywshowers':    'partlycloudy',
  'partlycloudywshowers':   'partlycloudy',
  'mostlycloudywshowers':   'cloudy',
  'showers':                'rain',
  'rain':                   'rain',
  'tstorms':                'rain',
  'thunderstorms':          'rain',  
  'partlycloudywtstorms':   'partlycloudy',
  'mostlycloudywtstorms':   'cloudy',
  'hazysunshine':           'cloudy',
  'hazymoonlight':          'cloudy',
  'fog':                    'fog',
  'partlysunnywflurries':   'partlycloudy',
  'mostlycloudywflurries':  'cloudy',
  'rainandsnow':            'snow',
  'flurries':               'snow',
  'snow':                   'snow',
  'partlycloudywtstorms':	  'partlycloudy',
}) // https://i.imgur.com/LgkxoJx.png

const labelEmotes = {
  'clear': '☀',
  'partlycloudy': '⛅',
  'cloudy': '☁',
  'rain': '☔',
  'snow': '⛄',
  'fog': '🌫',
  'windy': '🎐',
  'alert': '⚠',
  'none': '🚫'
}

const thresholds = {
  dominant: {
    'rain': 60,
    'snow': 60,
    // 'wind': 55, // DEBUG: This was our old wind model
    'wind': 24.1,
    'gust': 31.1,
  },
  superficial: {
    'rain': 50,
    'snow': 50,
    'wind': 16, // DEBUG: This was our old wind model, and I'm keeping it for superficial wind
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
    // wind + gust >= thresholds.dominant.wind ? 'windy' : // DEBUG: This was our old wind model
    (wind >= thresholds.dominant.wind || gust >= thresholds.dominant.gust)  ? 'windy' :
    labelmap[label],
  superficial: {
    'snow': snow >= thresholds.superficial.snow,
    'rain': precip >= thresholds.superficial.rain,
    'windy': wind >= thresholds.superficial.wind
  }
})
//NOTE: Apparently AW 'w/ showers' overrides this entirely: 
// https://www.reddit.com/r/TheSilphRoad/comments/9uoz3r/the_usual_requirement_for_wind_seems_to_have/e95x731/
//NOTE: Also, more wind models (and confirmation on the eight-hourly forecasts)
// https://old.reddit.com/r/TheSilphRoad/comments/aks0k7/weather_gone_germany/ef7jnwu/


module.exports = {
  labelmap,
  labelEmotes,
  thresholds,
  aw2pogo
}