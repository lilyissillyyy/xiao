const Command = require('../../framework/Command');
const { PermissionFlagsBits } = require('discord.js');
const { createCanvas, loadImage } = require('@napi-rs/canvas');
const path = require('path');
const { wrapText } = require('../../util/Canvas');
const characters = require('../../assets/json/undertale');

module.exports = class UndertaleCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'undertale',
			aliases: [
				'ut',
				'undertale-dialogue',
				'ut-dialogue',
				'undertale-dialog',
				'ut-dialog',
				'undertale-quote',
				'ut-quote'
			],
			group: 'edit-image-text',
			description: 'Sends a text box from Undertale with the quote and character of your choice.',
			details: `**Characters:** ${characters.join(', ')}`,
			throttling: {
				usages: 2,
				duration: 10
			},
			clientPermissions: [PermissionFlagsBits.AttachFiles],
			credit: [
				{
					name: 'UNDERTALE',
					url: 'https://undertale.com/',
					reason: 'Original Game'
				},
				{
					name: 'Demirramon',
					url: 'https://www.demirramon.com/',
					reason: 'Images',
					reasonURL: 'https://www.demirramon.com/en/generators/undertale_text_box_generator'
				},
				{
					name: 'Carter Sande',
					url: 'https://gitlab.com/cartr',
					reason: 'DeterminationMono, UndertaleSans, and UndertalePapyrus Fonts',
					reasonURL: 'https://gitlab.com/cartr/undertale-fonts/tree/master'
				},
				{
					name: 'Sigmath Bits',
					url: 'https://fontstruct.com/fontstructors/1280718/sigmath6',
					reason: 'Pixelated Wingdings Font',
					reasonURL: 'https://fontstruct.com/fontstructions/show/1218140/pixelated-wingdings'
				},
				{
					name: 'EarthBound Central',
					url: 'https://earthboundcentral.com/',
					reason: 'Apple Kid Font',
					reasonURL: 'https://earthboundcentral.com/2009/11/ultimate-earthbound-font-pack/'
				}
			],
			args: [
				{
					key: 'character',
					type: 'string',
					oneOf: characters,
					parse: character => character.toLowerCase()
				},
				{
					key: 'quote',
					type: 'string',
					max: 250
				}
			]
		});
	}

	async run(msg, { character, quote }) {
		const base = await loadImage(
			path.join(__dirname, '..', '..', 'assets', 'images', 'undertale', `${character}.png`)
		);
		const canvas = createCanvas(base.width, base.height);
		const ctx = canvas.getContext('2d');
		ctx.drawImage(base, 0, 0);
		let font = 'DeterminationMono.ttf';
		let space = -3;
		let y = 31;
		switch (character) {
			case 'sans':
				font = 'UndertaleSans.ttf';
				quote = quote.toLowerCase();
				space = -4;
				y = 26;
				break;
			case 'papyrus':
				font = 'UndertalePapyrus.ttf';
				quote = quote.toUpperCase();
				space = -5;
				y = 26;
				break;
			case 'napstablook':
				quote = quote.toLowerCase();
				break;
			case 'gaster':
				font = 'pixelated-wingdings.ttf';
				space = -4;
				y = 20;
				break;
			case 'ness':
				font = 'apple_kid.ttf';
				space = -2;
				y = 22;
				break;
			case 'temmie':
				quote = this.client.registry.commands.get('temmie').temmize(quote);
				break;
		}
		ctx.font = this.client.fonts.get(font).toCanvasString(32);
		ctx.fillStyle = 'white';
		ctx.textBaseline = 'top';
		const text = wrapText(ctx, quote, 385);
		const lines = text.length > 3 ? 3 : text.length;
		for (let i = 0; i < lines; i++) {
			ctx.fillText(text[i], 174, y + (y * i) + (13 * i) + (space * i));
		}
		return msg.say({ files: [{ attachment: canvas.toBuffer('image/png'), name: `undertale-${character}.png` }] });
	}
};
