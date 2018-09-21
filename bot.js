const JSONDB = require('node-json-db')

const configDb = new JSONDB('config', true, true)
const config = configDb.getData('/') || {}
exports.config = config

const Discord = require("discord.js")
const RC = require('reaction-core')

const client = new Discord.Client()
client.login(process.env.DISCORDKEY)

exports.client =  new Promise((resolve, reject) => client.on("ready", () => {
    console.log("Castform is ready")
    resolve(client)
  })
)

client.on('message', message => {
  if (message.isMentioned(client.user)) {
    if (!message.member.permissions.has('MANAGE_ROLES')) {
      message.channel.send("You do not have the necessary permissions to configure me.")
      return
    }
    const setChannel = message.content.match(/<@!?[0-9]*> (?<command>setChannel) <#(?<channel>[0-9]*)>/)
    if (setChannel) {
      Object.assign(config, {[message.guild.id]: {channel: setChannel.groups.channel}})
      configDb.push(`/`, config)
      message.channel.send("Weather forecast channel set.")
      return
    }
    message.channel.send("I don't quite understand you.")
  }
})