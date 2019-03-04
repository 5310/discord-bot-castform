const JSONDB = require('node-json-db')
const Discord = require('discord.js')

const configDb = new JSONDB('config', true, true)
const config = configDb.getData('/') || {}

const client = new Discord.Client()
client.login(configDb.getData('/key'))

client.on('message', message => {
  if (message.isMentioned(client.user)) {
    if (!message.member.permissions.has('MANAGE_ROLES')) {
      message.channel.send('You do not have the necessary permissions to configure me.')
      return
    }
    const setChannel = message.content.match(/<@!?[0-9]*> (?<command>setChannel) <#(?<channel>[0-9]*)>/)
    if (setChannel) {
      Object.assign(config, { [message.guild.id]: { channel: setChannel.groups.channel } })
      configDb.push(`/`, config)
      message.channel.send('Weather forecast channel set.')
      return
    }
    message.channel.send("I don't quite understand you.")
  }
})

const send = message => Object.keys(config)
  .map(key => ({ guild: client.guilds.get(key), channelId: config[key].channel }))
  .filter(({ guild }) => guild)
  .map(({ guild, channelId }) => guild.channels.get(channelId))
  .filter(channel => channel)
  .forEach(channel => channel.send(message))

module.exports = {
  config,
  send,
  client: new Promise((resolve, reject) => client.on('ready', () => {
    console.log('Discord bot is ready')
    resolve(client)
  })
  ),
}
