const Command = require('../../framework/Command');
const { PermissionFlagsBits } = require('discord.js');
const { createCanvas, loadImage } = require('@napi-rs/canvas');
const path = require('path');
const { wrapText, fillTextWithBreaks } = require('../../util/Canvas');

module.exports = class ChangeMyMindCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'change-my-mind',
			aliases: ['change-mind', 'mind-change', 'cmv', 'cmm'],
			group: 'edit-meme',
			description: 'Sends a "Change My Mind" meme with the text of your choice.',
			throttling: {
				usages: 2,
				duration: 10
			},
			clientPermissions: [PermissionFlagsBits.AttachFiles],
			credit: [
				{
					name: 'Google',
					url: 'https://www.google.com/',
					reason: 'Noto Font',
					reasonURL: 'https://www.google.com/get/noto/'
				}
			],
			args: [
				{
					key: 'text',
					type: 'string',
					max: 500
				}
			]
		});
	}

	async run(msg, { text }) {
		const base = await loadImage(path.join(__dirname, '..', '..', 'assets', 'images', 'change-my-mind.png'));
		const canvas = createCanvas(base.width, base.height);
		const ctx = canvas.getContext('2d');
		ctx.textBaseline = 'top';
		ctx.drawImage(base, 0, 0);
		ctx.rotate(-24 * (Math.PI / 180));
		ctx.font = this.client.fonts.get('Noto-Regular.ttf').toCanvasString(35);
		let fontSize = 35;
		while (ctx.measureText(text).width > 843) {
			fontSize--;
			ctx.font = this.client.fonts.get('Noto-Regular.ttf').toCanvasString(fontSize);
		}
		const lines = wrapText(ctx, text, 337);
		fillTextWithBreaks(ctx, lines.join('\n'), 142, 430, 337);
		ctx.rotate(24 * (Math.PI / 180));
		return msg.say({ files: [{ attachment: canvas.toBuffer('image/png'), name: 'change-my-mind.png' }] });
	}
};
