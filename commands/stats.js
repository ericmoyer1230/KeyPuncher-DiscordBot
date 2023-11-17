const { SlashCommandBuilder } = require('discord.js');

module.exports = { 
	data: new SlashCommandBuilder()
		.setName('stats')
		.setDescription('Displays stats')
		.addUserOption(option => 
			option
			.setName('member')
			.setDescription('Specifiy who you want to see the stats of (Leave blank for yourself)')			
			),
		async execute(interaction) {}

}
