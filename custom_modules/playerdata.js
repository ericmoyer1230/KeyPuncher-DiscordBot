const {Client, ActionRowBuilder, ButtonBuilder, ButtonStyle, Events, Collection, REST, Routes,SlashCommandBuilder, GatewayIntentBits, EmbedBuilder, AttachmentBuilder, RoleManager, GuildMemberRoleManager, Role, Guild, InteractionCollector, ChatInputCommandInteraction, GuildMember, SlashCommandRoleOption, GuildFeature, GuildMemberManager, CommandInteractionOptionResolver} = require('discord.js')
const fs = require('fs') // importing file save
const storagepath = 'storage.json'
const itempricing = require('../itempricing.json')


function checkplayerdata(playerid){ // reads playerdata
    var allplayerdata = JSON.parse(fs.readFileSync(storagepath))
    let defaultdata = {experience: 0, messagessent: 0, money: 0, level:1, cooldowns:{work:0},items:{}}
        if(!allplayerdata[playerid]){ // checks for previous player data creation, If player data does not exist it creates default data.
            allplayerdata[playerid] = defaultdata
            fs.writeFileSync(storagepath, JSON.stringify(allplayerdata, 0, 2))
            console.log(`created player data for ${playerid}`)
            return(allplayerdata[playerid])
    } else {
        return(allplayerdata[playerid])
    }
}

function getallplayerdata(){
    let storageread = fs.readFileSync(storagepath)
    return(JSON.parse(storageread))
}

function writeplayerdata(data){
    fs.writeFileSync(storagepath, JSON.stringify(data, 0, 2))
}

const commandcooldowns = {work: 0}

class playerDataclass{
    constructor(playerid){
        this._playerdata = checkplayerdata(playerid)
        this._level = checkplayerdata(playerid).level
        this._experience = checkplayerdata(playerid).experience
        this._money = checkplayerdata(playerid).money
        this._messagessent = checkplayerdata(playerid).messagessent
        this._workcooldown = checkplayerdata(playerid).cooldowns.work
        this._items = checkplayerdata(playerid).items
        this._currentitems = checkplayerdata(playerid).currentitems
        this._playerid = playerid
    }
    get items(){
        return this._items
    }
    get currentitems(){
        return this._currentitems
    }
    useitem(item){
        let allplayerdata = getallplayerdata()
        if(!allplayerdata[this._playerid].currentitems[item]){
            allplayerdata[this._playerid].currentitems[item] = itempricing[item].use
        } else {
            allplayerdata[this._playerid].currentitems[item] += itempricing[item].use
        }
        allplayerdata[this._playerid].items[item] -= 1
        if(allplayerdata[this._playerid].items[item] <= 0){
            delete allplayerdata[this._playerid].items[item]
        }
        writeplayerdata(allplayerdata)
    }
    reduceactive(item){
        let allplayerdata = getallplayerdata()
        allplayerdata[this._playerid].currentitems[item] -= 1
        if(allplayerdata[this._playerid].currentitems[item] == 0){
            delete allplayerdata[this._playerid].currentitems[item]
        }
        writeplayerdata(allplayerdata)
    }
    additem(item,num = 1){
    let allplayerdata = getallplayerdata()
    if(!allplayerdata[this._playerid].items[item]){
        allplayerdata[this._playerid].items[item] = 0
    }
    allplayerdata[this._playerid].items[item] += num
    writeplayerdata(allplayerdata)
    return allplayerdata[this._playerid].items[item]
    }
    get level(){
        return this._level
    }
    get nextlvlexp(){
        return 4 + Math.pow(this._level,2)
    }
    set level(num){
        if(!typeof num == 'number'){
            console.error('You must input a number : setlevel')
        } else {
            let allplayerdata = getallplayerdata()
            allplayerdata[this._playerid].level = num
            writeplayerdata(allplayerdata)
        }
    }
    addlevel(removeexp = true){
        if(removeexp){
            let allplayerdata = getallplayerdata()
            allplayerdata[this._playerid].experience = this._experience -= 4 + Math.pow(this._level,2)
            allplayerdata[this._playerid].level = this._level += 1
            writeplayerdata(allplayerdata)
        } else {
            let allplayerdata = getallplayerdata()
            allplayerdata[this._playerid].level = this._level += 1
            writeplayerdata(allplayerdata)
        }
    }
    get experience(){
        return this._experience
    }
    set experience(num){
        if(!typeof num == 'number'){
            console.error('You must input a number : setexperience')
        } else {
            let allplayerdata = getallplayerdata()
            allplayerdata[this._playerid].experience = num
            writeplayerdata(allplayerdata)
        }
    }
    get money(){
        return this._money
    }
    set money(num){
        if(!typeof num == 'number'){
            console.error('You must input a number : setmoney')
        } else {
            let allplayerdata = getallplayerdata()
            allplayerdata[this._playerid].money = num
            writeplayerdata(allplayerdata)
        }
    }
    get messagessent(){
        return this._messagessent
    }
    set messagessent(num){
        if(!typeof num == 'number'){
            console.error('You must input a number : setmessagesent')
        } else {
            let allplayerdata = getallplayerdata()
            allplayerdata[this._playerid].messagessent = num
            writeplayerdata(allplayerdata)
        }
    }
    get workcooldown(){
        return this._workcooldown
    }
    set workcooldown(num){
        if(!typeof num == 'number'){
            console.error('You must input a number : setworkcooldown')
        }
    }
    canwork(){
        if(Date.now() > this._workcooldown){
            return true
        } else{
            return false
        }
    }
    togglework(){
        if(this.canwork()){
            let allplayerdata = getallplayerdata()
            allplayerdata[this._playerid].cooldowns.work = commandcooldowns.work + Date.now()
            writeplayerdata(allplayerdata)

        } else {
            console.error('The user cannot work due to cooldown being greater than current time : togglework()')
        }
    }
    
}

module.exports.playerDataclass = playerDataclass