const Command = require('../../framework/Command');
const { PermissionFlagsBits } = require('discord.js');
const { createCanvas, loadImage } = require('@napi-rs/canvas');
const path = require('path');

module.exports = class SpeedLimitCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'speed-limit',
			aliases: ['speed', 'speed-limit-sign'],
			group: 'edit-image-text',
			description: 'Sends a Speed Limit sign with the limit of your choice.',
			throttling: {
				usages: 2,
				duration: 10
			},
			clientPermissions: [PermissionFlagsBits.AttachFiles],
			credit: [
				{
					name: 'Ash Pikachu Font',
					url: 'https://www.dafont.com/ashpikachu099.d2541',
					reason: 'Highway Gothic Font',
					reasonURL: 'https://www.dafont.com/highway-gothic.font'
				}
			],
			args: [
				{
					key: 'limit',
					type: 'string',
					max: 5
				}
			]
		});
	}

	async run(msg, { limit }) {
		const base = await loadImage(path.join(__dirname, '..', '..', 'assets', 'images', 'speed-limit.png'));
		const canvas = createCanvas(base.width, base.height);
		const ctx = canvas.getContext('2d');
		ctx.drawImage(base, 0, 0);
		ctx.textBaseline = 'top';
		ctx.textAlign = 'center';
		ctx.font = this.client.fonts.get('HWYGWDE.ttf').toCanvasString(360);
		ctx.fillStyle = 'black';
		ctx.fillText(limit.toUpperCase(), 313, 356, 475);
		return msg.say({ files: [{ attachment: canvas.toBuffer('image/png'), name: 'speed-limit.png' }] });
	}
};
