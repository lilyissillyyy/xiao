const Command = require('../../framework/Command');
const { PermissionFlagsBits } = require('discord.js');
const { createCanvas, loadImage } = require('@napi-rs/canvas');
const path = require('path');
const { wrapText, fillTextWithBreaks } = require('../../util/Canvas');
const coord = [[450, 129], [1200, 134], [450, 627], [1200, 627]];

module.exports = class GruPlanCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'gru-plan',
			aliases: ['grus-plan', 'gru'],
			group: 'edit-meme',
			description: 'Sends a Gru\'s Plan meme with steps of your choice.',
			throttling: {
				usages: 2,
				duration: 10
			},
			clientPermissions: [PermissionFlagsBits.AttachFiles],
			credit: [
				{
					name: 'Illumination',
					url: 'http://www.illumination.com/',
					reason: 'Original "Despicable Me" Movie',
					reasonURL: 'http://www.despicable.me/'
				},
				{
					name: 'Google',
					url: 'https://www.google.com/',
					reason: 'Noto Font',
					reasonURL: 'https://fonts.google.com/noto'
				}
			],
			args: [
				{
					key: 'step1',
					label: 'step 1',
					type: 'string',
					max: 150
				},
				{
					key: 'step2',
					label: 'step 2',
					type: 'string',
					max: 150
				},
				{
					key: 'step3',
					label: 'step 3',
					type: 'string',
					max: 150
				}
			]
		});
	}

	async run(msg, { step1, step2, step3 }) {
		const steps = [step1, step2, step3, step3];
		const base = await loadImage(path.join(__dirname, '..', '..', 'assets', 'images', 'gru-plan.png'));
		const canvas = createCanvas(base.width, base.height);
		const ctx = canvas.getContext('2d');
		ctx.drawImage(base, 0, 0);
		ctx.fillStyle = 'black';
		ctx.textBaseline = 'top';
		let i = 0;
		for (const [x, y] of coord) {
			ctx.font = this.client.fonts.get('Noto-Regular.ttf').toCanvasString(35);
			const step = steps[i];
			let fontSize = 35;
			while (ctx.measureText(step).width > 1100) {
				fontSize--;
				ctx.font = this.client.fonts.get('Noto-Regular.ttf').toCanvasString(fontSize);
			}
			const lines = wrapText(ctx, step, 252);
			fillTextWithBreaks(ctx, lines.join('\n'), x, y);
			i++;
		}
		return msg.say({ files: [{ attachment: canvas.toBuffer('image/png'), name: 'gru-plan.png' }] });
	}
};
