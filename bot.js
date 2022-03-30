const reminders = require('./events.json')
const Discord = require("discord.js")
let logger = require('winston')
const responses = require('./responses.json')

// Configure Logger Settings
logger.remove(logger.transports.Console)
logger.add(new logger.transports.Console, {
    colorize: true
})
logger.level = "debug"

// Initialize Bot
const bot = new Discord.Client({
    token: process.env.DISCORD_TOKEN,
    autorun: true,
    intents: ['GUILDS', 'GUILD_MESSAGES']
})

bot.once('ready', function (evt) {
    logger.info('Connected')
    logger.info('Annoying Kid has Arrived.')
})

bot.on('message', message => {
    console.log(message)

    if (message.content.substring(0, 1) === '!') {
        let stringArray = message.content.substring(1).split(' ')
        let cmd = stringArray[0]

        switch (cmd) {
            case 'help':
                message.channel.send(
                    `
Ugh, I can't believe you don't even know my commands yet, jfc. Just look below and see what I have to offer.

Prepend commands with '!' to execute the following commands:
- **!help**: You're here already.
- **!insult**: Receive an insult from me. 
- **!wiki [thing you want to search for]**: I pull up a wikipedia page for your lazy ass.
- **!alex**: Bitch ass Alex
- **!jerry**: Bitch ass Jerry
- **!gabe**: Bitch ass Gabe
- **!slug**: Pimp Nick
                    `
                )
                break

            case 'insult':
                message.channel.send(responses.insult[Math.floor(Math.random() * responses.insult.length)])
                break

            case 'wiki':
                for (let string of stringArray) {
                    string.split('')[0].toUpperCase()
                }
                stringArray.shift()
                message.channel.send(`
                    ${responses.deliver[Math.floor(Math.random() * responses.deliver.length)]}
                    https://en.wikipedia.org/wiki/${stringArray.join('_')}`
                )
                break

            case 'alex':
                message.channel.send({files: ['images/alex_sombrero.png']})
                break

            case 'jerry':
                message.channel.send({files: ['images/jerry_optimistic.png']})
                break

            case 'gabe':
                message.channel.send({files: ['images/gabe_sinister.png']})
                break

            case 'slug':
                message.channel.send({files: ['images/slug_doubtful.png']})
                break

            case 'reminder':
                message.channel.send(`${reminders[0].name} is happening on ${reminders[0].date}`)
                break
        }
    }
})

bot.login(process.env.DISCORD_TOKEN)
