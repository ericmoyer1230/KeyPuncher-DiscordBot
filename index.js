const {Client, ActionRowBuilder, ButtonBuilder, ButtonStyle, Events, Collection, REST, Routes,SlashCommandBuilder, GatewayIntentBits, EmbedBuilder, AttachmentBuilder, RoleManager, GuildMemberRoleManager, Role, Guild, InteractionCollector, ChatInputCommandInteraction, GuildMember, SlashCommandRoleOption, GuildFeature, GuildMemberManager, CommandInteractionOptionResolver, chatInputApplicationCommandMention} = require('discord.js')
const client = new Client({intents:[3276799],})
const util = require('minecraft-server-util');
const path = require('node:path');
const fs = require('fs') // importing file save
require('dotenv/config')
const XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
const playerdataclassconst = require('./custom_modules/playerdata')
const playerDataclass = playerdataclassconst.playerDataclass
const itempricing = require("./itempricing.json")
const minecraftoptions = {
    timeout: 1000 * 5, // timeout in milliseconds
    enableSRV: true // SRV record lookup
};
function checknextlevelexp(level){ // next level requirement math function
    let requiredexp = 4 + Math.pow(level,2)
    return requiredexp
}

client.on('messageCreate', async (message) => { // +1 experience on message sent
    if(!message.author.bot){
            let playerstats = new playerDataclass(message.author.id)
            playerstats.experience += 1
            playerstats.messagessent += 1
            if(playerstats.experience >= playerstats.nextlvlexp){
                playerstats.addlevel()
                let embed = new EmbedBuilder()
                .setColor('a3612a')
                embed.setAuthor({name:message.author.username, iconURL:message.author.displayAvatarURL()})     
                embed.setTitle(`You leveled up!`)
                embed.setDescription(`You are now level **${playerstats.level + 1}**. You now need **${playerstats.nextlvlexp}** experience to level up!`)
                message.channel.send({embeds: [embed]})
        }
    }})

    client.on('guildMemberAdd', async(member) =>{ // Adds a predefined role when a user joins the server
        let guild = await member.guild
        let rolescache = await guild.roles.cache
        let guestrole = rolescache.get("1041796851415916576")
        if(guestrole){
        member.roles.add(guestrole)}
    })

client.on('interactionCreate', (interaction) => { // Bulk delete command for messages sent within the server
    if(interaction.commandName == 'bulkdelete'){
        const number = interaction.options.getNumber('number')
    interaction.channel.messages.fetch({ limit: number, cache: false })
        .then(async (messages) => {
            interaction.channel.bulkDelete(messages)
            interaction.reply({ephemeral: true, content:'Deleted ' + number + ' messages.'})
            })
        .catch(console.error)
        }
})

client.on('interactionCreate', async (interaction) => { // Displays the ping of the bot
    if(interaction.commandName == 'ping'){
        let embed = new EmbedBuilder()
            .setColor('a3612a')
            .setDescription(`The current ping is **${client.ws.ping}ms**`)
            await interaction.reply({embeds: [embed]})
    }
}) 

const updateserver = async () => { // Grabs the current player count from the minecraft server we have and displays it on the description of the discord bot
    util.status(process.env.IP,25568)
    .then(async (mcserverinfo) => {
        let today = new Date();
        let curtime = `${today.getHours()}:${today.getMinutes()}:${today.getSeconds()}`
        client.user.setPresence({ activities:[{name : `${mcserverinfo.players.online}/${mcserverinfo.players.max} Players online.`}]})
        console.log(`Updated minecraft server count to  ${mcserverinfo.players.online}/${mcserverinfo.players.max}. ${curtime}`)
    })
    .catch((error) => {
        console.log(error)
        client.user.setPresence({ activities:[{name : `Minecraft server currently down...`}]})
    });
    setTimeout(updateserver, process.env.UPDATEFREQ * 1000)
}

client.on('interactionCreate', async (interaction) => { // Displays player stats such as Level, Current Experience, Required Experience to level up, Money, And total messages sent within the server
    if(interaction.commandName == 'stats'){
        let member = interaction.options.getUser('member')
        if(!member){
        let playerstats = new playerDataclass(interaction.user.id)
        let requiredexp = checknextlevelexp(playerstats.level)
        let embed = new EmbedBuilder()
            .setColor('a3612a')
            embed.setAuthor({name:interaction.user.username, iconURL:interaction.user.displayAvatarURL()})
            embed.setDescription(`Level : **${playerstats.level}**
                                  Experience : **${playerstats.experience}**
                                  Exp to level up : **${requiredexp}**
                                  Money : **$${playerstats.money}**
                                  Messages sent : **${playerstats.messagessent}**`)
            interaction.reply({embeds: [embed]})
        }else{
        let playerstats = new playerDataclass(member.id)
        let requiredexp = checknextlevelexp(playerstats.level)
        let embed = new EmbedBuilder()
            .setColor('a3612a')
            embed.setAuthor({name:member.username, iconURL:member.displayAvatarURL()})
            embed.setDescription(`Level : **${playerstats.level}**
                                  Experience : **${playerstats.experience}**
                                  Exp to level up : **${requiredexp}**
                                  Money : **$${playerstats.money}**
                                  Messages sent : **${playerstats.messagessent}**`)
            interaction.reply({embeds: [embed]})}
    }}
)

client.on('interactionCreate', async (interaction) => { // Displays the current commands created
    if(interaction.commandName == 'commands'){
        let commandlist = fs.readdirSync('./commands').map(str => str.slice(0, -3)).sort(function(a, b){return b.length - a.length;})
        for(let i = 0; i < commandlist.length; i++){
            let newword = commandlist[i]
            let firstletter = commandlist[i][0].toUpperCase()
            commandlist[i] = firstletter + newword.slice(1)
        }
        let embed = new EmbedBuilder()
            .setColor('a3612a')
            embed.setAuthor({name:interaction.user.username, iconURL:interaction.user.displayAvatarURL()})
            embed.setTitle('Current commands')
            embed.setDescription(commandlist.join('\n'))
            interaction.reply({embeds: [embed]})
    }
})


client.on('interactionCreate', async (interaction) => { // A "Work" action made to attain money within the server
    if(interaction.commandName == 'work'){
        let playerstats = new playerDataclass(interaction.user.id)
        let embed = new EmbedBuilder()
            .setColor('a3612a')
            embed.setAuthor({name:interaction.user.username, iconURL:interaction.user.displayAvatarURL()})
            embed.setTitle('👷‍♂️ Work 👷‍♂️')
        if(playerstats.canwork()){
            let multiplier = 1
            if(playerstats.currentitems.Cookie){
                if(playerstats.currentitems.Cookie > 0){
                    multiplier = 2
                    playerstats.reduceactive('Cookie')
                }
            }
            let workedammount = Math.floor(Math.random() * (multiplier * 750) + 250)
            playerstats.money += workedammount
            playerstats.togglework()
            if(multiplier > 1){
                if(playerstats.currentitems.Cookie == 1){
                embed.setDescription(`You worked hard for **$${workedammount}**, You now have **$${playerstats.money + workedammount}**

                *Multiplier of **${multiplier}x***`)
                interaction.reply({embeds: [embed]})                                    
                }else{
                embed.setDescription(`You worked hard for **$${workedammount}**, You now have **$${playerstats.money + workedammount}**

                                    *Multiplier of **${multiplier}x**        ${playerstats.currentitems.Cookie - 1} left*`)
                interaction.reply({embeds: [embed]})}
            }else{
                embed.setDescription(`You worked hard for **$${workedammount}**! 

                                    You now have **$${playerstats.money + workedammount}**`)
                interaction.reply({embeds: [embed]})
            }
        }else{
            let timeremaining = playerstats.workcooldown - Date.now()
            let remainingseconds = Math.floor((timeremaining / 1000) % 60)
            let remainingminutes = Math.floor(timeremaining / 60000) 
            embed.setDescription(`You cannot work right now, 
            
                                  You must wait **${remainingminutes}** Minutes,  **${remainingseconds}** seconds`)
            interaction.reply({embeds: [embed]})
        }

    }})

    client.on('interactionCreate', async (interaction) => { // A coin flip made for the discord bot
        if(interaction.commandName == 'coinflip'){
        let playerstats = new playerDataclass(interaction.user.id)
        let number = interaction.options.getNumber('number')
        let embed = new EmbedBuilder()
        .setColor('a3612a')
        .setAuthor({name:interaction.user.username, iconURL:interaction.user.displayAvatarURL()})
        .setTitle('Coinflip')
        if (playerstats.money >= number){
            let result = Math.round(Math.random())
        if (result){
            playerstats.money += number
            embed.setDescription(`✅ You won the coinflip and gained **$${number}** ✅
            
                                      You now have **$${number + playerstats.money}**`)
            interaction.reply({embeds: [embed]})
        } else { 
            playerstats.money -= number 
            embed.setDescription(`❌ You did not win the coinflip and lost **$${number}** ❌
            
                                      You now have **$${playerstats.money - number}**`)
            interaction.reply({embeds: [embed]})
        }
        } else {
            embed.setDescription(`You currently do not have enough money...
            
                                  You currently have **$${playerstats.money}**`)
            interaction.reply({embeds: [embed]})
        } 
    }})

    client.on('interactionCreate', async (interaction) => { // A shop made for the discord bot allowing you to buy various multipliers/modifiers
        if(interaction.commandName == 'shop'){
            let user = new playerDataclass(interaction.user.id)
            let embed = new EmbedBuilder()
                .setColor('a3612a')
                .setAuthor({name:interaction.user.username, iconURL:interaction.user.displayAvatarURL()})
                .setTitle('💰 Item Shop 💰')
                let item = interaction.options.getString('item')
            switch(interaction.options.getSubcommand()){
                case 'list':
                    let ownedcookie = 2
                    embed.setDescription(`Your Money : **${user.money}**
                                         **⎻⎻⎻⎻⎻⎻⎻⎻⎻⎻⎻⎻⎻⎻⎻⎻⎻⎻⎻⎻⎻⎻⎻⎻⎻⎻⎻⎻⎻⎻⎻⎻⎻⎻⎻⎻⎻⎻⎻⎻⎻⎻⎻⎻⎻⎻⎻⎻⎻⎻⎻⎻⎻⎻⎻⎻⎻⎻⎻⎻⎻⎻⎻⎻⎻**
                                         🍪**Cookie**🍪 : Adds a **2x** multiplier for your next 5 /work commands
                                         Buy price :  **${itempricing.Cookie.buy}** - Sell price : **${itempricing.Cookie.sell}**
                                         **⎻⎻⎻⎻⎻⎻⎻⎻⎻⎻⎻⎻⎻⎻⎻⎻⎻⎻⎻⎻⎻⎻⎻⎻⎻⎻⎻⎻⎻⎻⎻⎻⎻⎻⎻⎻⎻⎻⎻⎻⎻⎻⎻⎻⎻⎻⎻⎻⎻⎻⎻⎻⎻⎻⎻⎻⎻⎻⎻⎻⎻⎻⎻⎻⎻**
                                         🍔**Burger**🍔 : Adds a **1.25x** multiplier to your next 5 /coinflip wins
                                         Buy price : **${itempricing.Burger.buy}** - Sell price : **${itempricing.Burger.sell}**
                                         **⎻⎻⎻⎻⎻⎻⎻⎻⎻⎻⎻⎻⎻⎻⎻⎻⎻⎻⎻⎻⎻⎻⎻⎻⎻⎻⎻⎻⎻⎻⎻⎻⎻⎻⎻⎻⎻⎻⎻⎻⎻⎻⎻⎻⎻⎻⎻⎻⎻⎻⎻⎻⎻⎻⎻⎻⎻⎻⎻⎻⎻⎻⎻⎻⎻**
                                         🍕**Pizza**🍕 : Prevents you from getting caught in your next 10 /crime activities
                                         Buy price : **${itempricing.Pizza.buy}** - Sell price : **${itempricing.Pizza.sell}**`)
                    interaction.reply({embeds:[embed]})
                    break
                case 'buy':
                    if(user.money >= itempricing[item].buy){
                        user.money -= itempricing[item].buy
                        let useritems = user.additem(item)
                        let svar = ''
                        if(useritems !== 1){svar = 's'}
                        embed.setDescription(`
                        You bought a **${item}** for **$${itempricing[item].buy}**

                        You now have **${useritems} ${item}${svar}**
                        `)
                        interaction.reply({embeds:[embed]})
                    } else {
                        embed.setDescription(`You do not have enough money for a ${item}
                  
                                              You have **$${user.money}** and need **$${itempricing[item].buy}**`)
                        interaction.reply({embeds:[embed]})
                    }
                    break
                case 'sell':
                    if(!user.items[item]){
                        embed.setDescription(`You do not have any ${item}s`)    
                        interaction.reply({embeds:[embed]})
                    }else if(user.items[item] <= 0){
                        embed.setDescription(`You do not have any ${item}s`)    
                        interaction.reply({embeds:[embed]})
                    }else{
                    user.additem(item,-1)
                    embed.setDescription(`You sold a ${item} for ${itempricing[item].sell}
                                          
                                        You now have **$${user.money}**`)    
                    interaction.reply({embeds:[embed]})
                    }
                    break
                default:
                    break
            }
        }
        })

        client.on('interactionCreate', async (interaction) => { // A command that allows you to display the current inventory
            if(interaction.commandName == 'inventory'){
                let user = new playerDataclass(interaction.user.id)
                let embed = new EmbedBuilder()
                    .setColor('a3612a')
                    .setAuthor({name:interaction.user.username, iconURL:interaction.user.displayAvatarURL()})
                    .setTitle('📦 Inventory 📦')
                    let item = interaction.options.getString('item')
                switch(interaction.options.getSubcommand()){
                    case 'list':
                        if(!Object.keys(user.items).length > 0){
                            embed.setDescription(`You currently do not have any items...`)
                            interaction.reply({embeds:[embed]})
                        } else {
                            let description = '**⎻⎻⎻⎻⎻⎻⎻⎻⎻⎻⎻⎻⎻⎻⎻⎻⎻⎻**\n'
                            for(let property in user.items){
                                if(user.items[property] > 0){
                                    switch(user.items[property]){
                                        case 1:
                                            description += `${property} : **${user.items[property]}**\n`
                                            break
                                        default:
                                            description += `${property}s : **${user.items[property]}**\n`
                                            break
                                    }
                                }
                            }
                            embed.setDescription(description)
                            interaction.reply({embeds:[embed]})
                        }
                        break
                    case 'use':
                        let item = interaction.options.getString('item')
                        if(!user.items[item]){
                            embed.setDescription(`You currently do not have any **${item}s**`)
                            interaction.reply({embeds:[embed]})
                        }else{
                            if(!user.items[item] > 0){
                                embed.setDescription(`You currently do not have any **${item}s**`)
                                interaction.reply({embeds:[embed]}) 
                            }else{
                                user.useitem(item)
                                embed.setDescription(`You used a ${item}`)
                                interaction.reply({embeds:[embed]}) 
                            }

                        }
                        
                        break
                    case 'active':
                        if(!Object.keys(user.currentitems).length > 0){
                            embed.setDescription(`You currently do not have any active items...`)
                            interaction.reply({embeds:[embed]})
                        } else {
                            let description = '**⎻⎻⎻⎻⎻⎻⎻⎻⎻⎻⎻⎻⎻⎻⎻⎻⎻⎻**\n'
                            for(let property in user.currentitems){
                                            description += `${property} : **${user.currentitems[property]}**\n`
                            }
                            embed.setTitle('📦 Active items 📦')
                            embed.setDescription(description)
                            interaction.reply({embeds:[embed]})
                        }
                        break
                    default:
                        break
                }
            }
            })

function reloadcommands(){ // Syncs the commands on the discord bot with the discord api
    const commands = [];
    const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
    for (const file of commandFiles) {
        const command = require(`./commands/${file}`);
        commands.push(command.data.toJSON());
    }
    const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);
    (async () => {
        try {
            rest.put(
                Routes.applicationGuildCommands('1042865048651059200', '1029483910033313823'),
                { body: commands },
                console.log('Reloaded slash commands')
            );
        } catch (error) {
            console.log(error);
        }})()}

client.on('ready',async  () =>{  // Displays a ConsoleLog stating the amount of servers and total user count, As well as syncs the commands to the discord endpoint
    reloadcommands()
    const userCount = client.guilds.cache.reduce((a, g) => a+g.memberCount, 0)
    console.log("The discord bot is currently in " + client.guilds.cache.size + " server('s) total with " + userCount + ' users total.' + "\nThe bot is ready")
    // updateserver()
    // getmctime()
          
    })


    
client.login(process.env.TOKEN) // Logs the client into the discord server