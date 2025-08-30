const Command = require('../../framework/Command');
const { EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const request = require('node-superfetch');
const { shorten, formatNumber } = require('../../util/Util');
const logos = require('../../assets/json/logos');

module.exports = class YuGiOhCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'yu-gi-oh',
			aliases: ['ygo'],
			group: 'search',
			description: 'Responds with info on a Yu-Gi-Oh! card.',
			clientPermissions: [PermissionFlagsBits.EmbedLinks],
			credit: [
				{
					name: 'Konami',
					url: 'https://www.konami.com/en/',
					reason: 'Original "Yu-Gi-Oh!" Game',
					reasonURL: 'https://www.yugioh-card.com/en/'
				},
				{
					name: 'YGOPRODECK',
					url: 'https://ygoprodeck.com/',
					reason: 'API',
					reasonURL: 'https://db.ygoprodeck.com/api-guide/'
				}
			],
			args: [
				{
					key: 'card',
					type: 'string'
				}
			]
		});
	}

	async run(msg, { card }) {
		try {
			const { body } = await request
				.get('https://db.ygoprodeck.com/api/v7/cardinfo.php')
				.query({ fname: card });
			const data = body.data[0];
			const embed = new EmbedBuilder()
				.setColor(0xBE5F1F)
				.setTitle(data.name)
				.setURL(`https://db.ygoprodeck.com/card/?search=${data.id}`)
				.setDescription(data.type === 'Normal Monster' ? `_${shorten(data.desc)}_` : shorten(data.desc))
				.setAuthor({ name: 'Yu-Gi-Oh!', iconURL: logos.yugioh, url: 'http://www.yugioh-card.com/' })
				.setThumbnail(data.card_images[0].image_url)
				.setFooter({ text: data.id.toString() })
				.addField('❯ Type', data.type, true)
				.addField(data.type.includes('Monster') ? '❯ Race' : '❯ Spell Type', data.race, true);
			if (data.type.includes('Monster')) {
				embed
					.addField('❯ Attribute', data.attribute, true)
					.addField('❯ Level', data.level?.toString() || 'N/A', true)
					.addField('❯ ATK', formatNumber(data.atk).toString(), true)
					.addField(
						data.type === 'Link Monster' ? '❯ Link Value' : '❯ DEF',
						formatNumber(data.type === 'Link Monster' ? data.linkval : data.def).toString(),
						true
					);
			}
			embed.addField('❯ TCGPlayer Price', `$${data.card_prices[0].tcgplayer_price}`);
			return msg.embed(embed);
		} catch (err) {
			if (err.status === 400) return msg.say('Could not find any results.');
			throw err;
		}
	}
};
