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
    snow >= exports.thresholds.dominant.snow ? 'snow' : 
    precip >= exports.thresholds.dominant.rain ? 'rain' :
    wind + gust >= exports.thresholds.dominant.wind ? 'windy' :
    exports.labelmap[label],
  superficial: {
    'snow': snow >= exports.thresholds.superficial.snow,
    'rain': precip >= exports.thresholds.superficial.rain,
    'windy': wind >= exports.thresholds.superficial.wind
  }
})
// =if(L2:L = "override", "snow", if (K2:K = "override", "rain", if(and(H2:H = "override", I2:I = "override"), "windy", E2:E)))


module.exports = {
  labelmap,
  labelEmotes,
  thresholds,
  aw2pogo
}