const Command = require('../../framework/Command');
const { PermissionFlagsBits } = require('discord.js');
const { createCanvas, loadImage } = require('@napi-rs/canvas');
const path = require('path');
const { wrapText, fillTextWithBreaks } = require('../../util/Canvas');

module.exports = class AlertCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'alert',
			aliases: ['presidential-alert'],
			group: 'edit-meme',
			description: 'Sends a Presidential Alert message with the text of your choice.',
			throttling: {
				usages: 2,
				duration: 10
			},
			clientPermissions: [PermissionFlagsBits.AttachFiles],
			credit: [
				{
					name: 'Apple',
					url: 'https://www.apple.com/',
					reason: 'San Francisco Font',
					reasonURL: 'https://developer.apple.com/fonts/'
				}
			],
			args: [
				{
					key: 'message',
					type: 'string',
					max: 280
				}
			]
		});
	}

	async run(msg, { message }) {
		const base = await loadImage(path.join(__dirname, '..', '..', 'assets', 'images', 'alert.png'));
		const canvas = createCanvas(base.width, base.height);
		const ctx = canvas.getContext('2d');
		ctx.drawImage(base, 0, 0);
		ctx.font = this.client.fonts.get('SF-Pro-Display-Medium.otf').toCanvasString(30);
		ctx.fillStyle = '#1f1f1f';
		ctx.textBaseline = 'top';
		let text = wrapText(ctx, message, 540);
		text = text.length > 3 ? `${text.slice(0, 3).join('\n')}...` : text.join('\n');
		fillTextWithBreaks(ctx, text, 48, 178);
		return msg.say({ files: [{ attachment: canvas.toBuffer('image/png'), name: 'alert.png' }] });
	}
};
