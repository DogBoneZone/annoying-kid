const AWS = require('aws-sdk')
const Discord = require("discord.js")
let logger = require('winston')
const responses = require('./responses.json')

// Update AWS Connection Details
AWS.config.update({
    region: process.env.AWS_DEFAULT_REGION,
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_KEY
})

// Create the service used to connect to DynamoDB
const docClient = new AWS.DynamoDB.DocumentClient()

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

// Functions
function helpMenu(message) {
    return message.channel.send(
`Ugh, I can't believe you don't even know my commands yet, jfc. Just look below and see what I have to offer.

Prepend commands with '!' to execute the following commands:
- **!help**: You're here already.
- **!insult**: Receive an insult from me. 
- **!wiki [thing you want to search for]**: I pull up a wikipedia page for your lazy ass.
- **!alex**: Bitch ass Alex
- **!jerry**: Bitch ass Jerry
- **!gabe**: Bitch ass Gabe
- **!slug**: Pimp Nick`)
}

function insultOutput(message) {
    return message.channel.send(responses.insult[Math.floor(Math.random() * responses.insult.length)])
}

function wikiSearch(stringArray, message) {
    for (let string of stringArray) {
        string.split('')[0].toUpperCase()
    }
    stringArray.shift()
    return message.channel.send(`
        ${responses.deliver[Math.floor(Math.random() * responses.deliver.length)]}
        https://en.wikipedia.org/wiki/${stringArray.join('_')}`
    )
}

function postReminder(stringArray, message) {
    let index = stringArray.indexOf('::') - 1
    let eventContent = stringArray.splice(1, index).join(' ')
    let eventDate = stringArray[stringArray.length - 1]

    // Setup the parameters required to save to Dynamo
    const params = {
        TableName: 'annoying-kid-memory',
        Item: {
            // Use Date.now() to generate a new unique value
            id: Date.now().toString(),
            // info is used to save actual data
            info: {eventContent: eventContent, eventDate: eventDate}
        }
    }

    docClient.put(params, (error) => {
        if (!error) {
            return channel.message.send(`Event successfully saved.`)
        } else {
            throw "Unable to save record, error" + error
        }
    })
    
    // Send the info as a message
    message.channel.send(`${eventContent}: ${eventDate}`)
}

// Execute functions based on message command
bot.on('message', message => {

    if (message.content.substring(0, 1) === '!') {
        let stringArray = message.content.substring(1).split(' ')
        let cmd = stringArray[0]

        switch (cmd) {
            case 'help':
                helpMenu(message)
                break

            case 'insult':
                insultOutput(message)
                break

            case 'wiki':
                wikiSearch(stringArray, message)
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
                postReminder(stringArray, message)
                break
        }
    }
})

bot.login('OTUzNzI3NTc5ODU1MTU5Mzk3.YjIyBg.D7XM0zeqZJp0yTbkXapTXS5T_RA')
// bot.login(process.env.DISCORD_TOKEN)
