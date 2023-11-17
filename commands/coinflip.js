const { SlashCommandBuilder } = require('discord.js');

module.exports = { 
	data: new SlashCommandBuilder()
		.setName('coinflip')
		.setDescription('Gamble with a coin flip!')
        .addNumberOption(option => 
                option
                .setName('number')
                .setDescription('Amount you want to gamble.')
                .setMinValue(1)
                .setMaxValue(100000)
                .setRequired(true)),
		async execute(interaction) {
		},
}
