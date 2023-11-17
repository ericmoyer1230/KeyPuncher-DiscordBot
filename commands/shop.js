const { SlashCommandBuilder } = require('discord.js');

module.exports = { 
	data: new SlashCommandBuilder()
		.setName('shop')
		.setDescription('Allows you to buy, sell, or list the items in the shop.')
		.addSubcommand(option => 
			option
			.setName('buy')
			.setDescription('Buy items from the shop')
            .addStringOption(option => 
                option
                    .setName('item')
                    .setDescription('What item to buy')
                    .addChoices({name: "Cookie", value:"Cookie"},{name: "Burger", value:"Burger"},{name: "Pizza", value:"Pizza"})
                    .setRequired(true)),			
			)
        .addSubcommand(option => 
            option
            .setName('sell')
            .setDescription('Sell items from your inventory')
            .addStringOption(stringoption => 
                stringoption
                    .setName('item')
                    .setDescription('What item to buy')
                    .addChoices({name: "Cookie", value:"Cookie"},{name: "Burger", value:"Burger"},{name: "Pizza", value:"Pizza"})
                    .setRequired(true)),			
            )
        .addSubcommand(option => 
            option
            .setName('list')
            .setDescription('Lists the shop')			
            ),
		async execute(interaction) {}
            
}
