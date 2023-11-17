const { SlashCommandBuilder } = require('discord.js');

module.exports = { 
	data: new SlashCommandBuilder()
		.setName('work')
		.setDescription('Work for money!'),
		async execute(interaction) {
		},
}
