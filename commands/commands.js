const { SlashCommandBuilder } = require('discord.js');

module.exports = { 
	data: new SlashCommandBuilder()
		.setName('commands')
		.setDescription('Displays all current commands'),
		async execute(interaction) {
		},
}
