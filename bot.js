const AWS = require('aws-sdk')
const Discord = require("discord.js")
let logger = require('winston')
const responses = require('./responses.json')

// Update AWS Connection Details
AWS.config.update({
    // region: process.env.AWS_DEFAULT_REGION,
    // accessKeyId: process.env.AWS_ACCESS_KEY,
    // secretAccessKey: process.env.AWS_SECRET_KEY
    region: 'us-west-1',
    accessKeyId: 'AKIA4B52D4IMKIQKFCUA',
    secretAccessKey: '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'
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
- **!reminder**: Set a reminder or event using the following format; 'Name or description of event' :: '01/31/2022'
-**!reminders**: Outputs reminders that are coming up in the current month
-**!--reminder**: Delete a reminder entry (WIP for now, still not finished)
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

    // Return message if date is incorrect format
    let dateArray = [...eventDate]
    if (dateArray.length != 10) {return message.channel.send('The date must be in standard short format: MM/DD/YYYY')}
    for (let index = 0; index <= 9; index++) {
        switch (index) {
            case 0:
            case 1:
            case 3:
            case 4:
            case 6:
            case 7:
            case 8:
            case 9:
                if (typeof Number(dateArray[index]) != 'number') {return message.channel.send('The date must be in standard short format: MM/DD/YYYY')}
                break

            case 2:
            case 5:
                if (dateArray[index] != '/') {return message.channel.send('The date must be in standard short format: MM/DD/YYYY')}
        }
    }

    // Setup the parameters required to save to DynamoDB
    const params = {
        TableName: 'annoying-kid-memory',
        Item: {
            // Use Date.now() to generate a new unique value
            id: Date.now().toString(),
            eventDate: eventDate,
            monthVal: Number([...eventDate].splice(0, 2).join('')),
            // info is used to save actual data
            content: eventContent
        }
    }

    docClient.put(params, (error) => {
        if (!error) {
            return message.channel.send(`Event successfully saved.`)
        } else {
            throw "I couldn't save this event for some reason... probably because I was programmed by an idiot." + error
        }
    })
    
    // Send the info as a message
    message.channel.send(`${eventContent}: ${eventDate}`)
}

function viewReminders(message) {
    
    const params = {
        TableName: 'annoying-kid-memory',
        FilterExpression: 'monthVal = :this_month',
        ExpressionAttributeValues: {':this_month': new Date().getMonth() + 1}
    }

    console.log(params)

    docClient.scan(params, (error, data) => {
        if (!error) {
            if (!data) {return message.channel.send('There are no upcoming events this month.')}
            else {
                let entries = []
                data.Items.forEach(item => {
                    entries.push(`${[...item.eventDate].splice(0, 5).join('')}: ${item.content}`)
                })
                let messageContent = `This Month's Events: \n${entries.join("\n")}`

                message.channel.send(messageContent)
            }
        } else {
            throw "I couldn't hack it.. something is up with the pull request from the database. Get Alex to solve this shit." + error
        }
    })
}

function deleteReminder(message) {
    console.log("Will Delete Reminder Placeholder")
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

            case 'reminders':
                viewReminders(message)
                break

            case '--reminder':
                deleteReminder(message)
        }
    }
})

bot.login(process.env.DISCORD_TOKEN)
