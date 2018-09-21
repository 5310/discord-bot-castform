# discord-bot-castform

This is a bot that given the locations queries AccuWeather for weather and converts it into in-game weather forecasts for Pokémon GO.

Since I can't afford to get a commercial AW key to serve the entire planet, I've built this solely for personal use. If you _don't_ play in Kolkata, India, you would have to run your own instance.

And if you do play around Kolkata feel free to add the [instance](https://discordapp.com/oauth2/authorize?client_id=490785142940500005&scope=bot&permissions=19520) I run.

## Install

This is a Node.js bot, install them as you see fit.

Consider using [pnpm](http://pnpm.js.org) to fetch dependencies since that's what I use.

## Configure

### Locations

The locations are configured in the `location.json` file.

It should be pretty self-explanatory from the default config for Kolkata: An object where the keys are shorthand names for the weather supercells you want to query, with longer names defined within the value object alongside the essential AccuWeather location ID.

You can get the AccuWeather location ID for your location by simply visiting your desired area from a browser and copying the id, like so: 

```
https://www.accuweather.com/en/in/kolkata/206690/weather-forecast/206690
                                  -area-- --ID--                  --ID--
```

### AccuWeather API Key

You'll need one from [AccuWeather APIs](https://developer.accuweather.com).

Yes, a free one will do, unless you add far too many locations and run out of your daily limit of 50 calls. That gives you 16 locations to query three times a day.

You'd need to set this as an environmental variable called `AWKEY`.

### Discord Bot Setup

Similarly, you'd need to define your Discord bot's secret as an environment variable called `DISCORDKEY`.

The bot needs at least the following permissions number: `19520`

You can refer to [An Idiot's Guide](https://anidiots.guide/) for more information. No, that's not me calling _you_ one :D