const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('bulkdelete')
		.setDescription('Deletes multiple messages.')
		.addNumberOption(option => 
			option
				.setName('number')
				.setDescription('Number of messages to delete in channel')
				.setMinValue(1)
				.setMaxValue(100)
				.setRequired(true)),
	async execute(interaction) {
	},
};