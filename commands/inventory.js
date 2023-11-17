const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('inventory')
		.setDescription('Displays your current inventory')
		.addSubcommand(option => 
			option
			.setName('use')
			.setDescription('Use items from your inventory')
            .addStringOption(option => 
                option
                    .setName('item')
                    .setDescription('What item to buy')
                    .addChoices({name: "Cookie", value:"Cookie"},{name: "Burger", value:"Burger"},{name: "Pizza", value:"Pizza"})
                    .setRequired(true)),			
			)
			.addSubcommand(option => 
				option
				.setName('list')
				.setDescription('Lists your inventory')			
				)
			.addSubcommand(option => 
				option
				.setName('active')
				.setDescription('Lists your active items')			
				),
	async execute(interaction) {},
};