# discord-bot-castform

This bot queries AccuWeather for configured locations and converts it into in-game weather forecasts for Pokémon GO.

In the distant past of 2018 Pokémon GO used to pull the forecasts from AccuWeather at predictable times of the day. We could reliably predict the in-game weather by just running those hours through our various models. But that's no longer the case, so the bot now scans every hour and reports all the forecasts for the next twelve hours like so:

![screenshot](./screenshot.png)

<sub>Look, Discord Flavored Markdown doesn't do tables. This is the best I can do. The most recent forecast is the leftmost column of emoji, and the rightmost column is the earliest. Naturally, the further into the future you go, the fewer forecasts are available, forming this nice triangle. And those black orbs are forecasts where no data is available for whatever reason.</sub>

Now, since I can't afford to get a commercial AW key to serve the entire planet, I've built this solely for personal use. Feel free to run your own instance though :D

## Install

This is a Node.js project. It also makes of of a lot of ES2015+ so use at least Node 10.x I myself will always be on the latest unstable.

## Configure
All the configuration for this bot is stored in a file named `config.json`. Duplicate the included `template.locations.json` and then and rename it to `config.json`. Edit this file to suit your needs.

### Locations

It should be pretty self-explanatory from the placeholder config for Kolkata: An object where the keys are shorthand names for the weather supercells you want to query, with longer names defined within the value object alongside the essential AccuWeather location ID, API Key, timezone, when to pull forecasts every hour, and an optional custom model name.

You can get the AccuWeather location ID for your location by simply visiting your desired area from a browser and copying the id, like so:

```
https://www.accuweather.com/en/in/kolkata/206690/weather-forecast/206690
                                  -area-- --ID--                  --ID--
```

In my city the weather cells are definitely level 10 S2 cells.

### AccuWeather API Key

You'll need at least _one_ from [AccuWeather APIs](https://developer.accuweather.com).

A free one will do, unless you add far too many locations and run out of your daily limit of 50 calls.

### Discord Webhook

[Create webhooks](https://support.discord.com/hc/en-us/articles/228383668-Intro-to-Webhooks) for the channels you need.

Inspect the webhook URLs this generates. They will contain an ID and token that you will need to add to the list of webhooks for every location in the config, like so:

```
https://discord.com/api/webhooks/<ID>/<token>
```

No example ID and token for you, don't want you spamming my channels ;]

A single instance of the bot can push webhooks to any number of Discord servers and channels within reason, as long as you set them up in the configuration.

### Data Storage

By default the bot will save all forecast data pulled from AccuWeather to dist under the `data/aw/<location>/` folders. And if you specified a custom model for your location, it'll save converted in-game predictions too, even though this information can also be directly derived from the AW data alone.

The AW data is needed used to compile reports from past forecasts every hour. If you want to delete these files, make sure to leave at least the last two days.
