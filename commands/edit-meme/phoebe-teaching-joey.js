const Command = require('../../framework/Command');
const { PermissionFlagsBits } = require('discord.js');
const { createCanvas, loadImage } = require('@napi-rs/canvas');
const path = require('path');
const coord = [
	[[136, 135], [416, 135]],
	[[136, 328], [416, 328]],
	[[136, 517], [416, 517]],
	[[136, 712], [416, 712]]
];

module.exports = class PhoebeTeachingJoeyCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'phoebe-teaching-joey',
			aliases: ['phoebe', 'phoebe-teach', 'joey', 'phoebe-teach-joey'],
			group: 'edit-meme',
			description: 'Sends a "Phoebe Teaching Joey" meme with text of your choice.',
			throttling: {
				usages: 2,
				duration: 10
			},
			clientPermissions: [PermissionFlagsBits.AttachFiles],
			credit: [
				{
					name: 'Warner Bros.',
					url: 'https://www.warnerbros.com/',
					reason: 'Images, Original "Friends" TV Series',
					reasonURL: 'https://www.warnerbros.com/tv/friends/'
				},
				{
					name: 'Google',
					url: 'https://www.google.com/',
					reason: 'Noto Font',
					reasonURL: 'https://www.google.com/get/noto/'
				}
			],
			args: [
				{
					key: 'correct',
					type: 'string',
					validate: correct => {
						if (correct.split(' ') < 3) return 'Please provide at least three words.';
						if (correct.length > 50) return 'Please keep the text below or exactly 50 characters.';
						return true;
					},
					parse: correct => {
						const words = correct.split(' ');
						const divided = Math.floor(words.length / 3);
						const first = words.slice(0, divided).join(' ');
						const second = words.slice(divided, divided * 2).join(' ');
						const third = words.slice(divided * 2, words.length).join(' ');
						return [first, second, third];
					}
				},
				{
					key: 'incorrect',
					type: 'string',
					max: 50
				}
			]
		});
	}

	async run(msg, { correct, incorrect }) {
		const steps = [...correct, incorrect];
		const base = await loadImage(path.join(__dirname, '..', '..', 'assets', 'images', 'phoebe-teaching-joey.png'));
		const canvas = createCanvas(base.width, base.height);
		const ctx = canvas.getContext('2d');
		ctx.drawImage(base, 0, 0);
		ctx.fillStyle = 'white';
		ctx.strokeStyle = 'black';
		ctx.lineWidth = 5;
		ctx.textBaseline = 'top';
		ctx.textAlign = 'center';
		let i = 0;
		for (const coords of coord) {
			let j = 0;
			for (const [x, y] of coords) {
				ctx.font = this.client.fonts.get('Noto-Regular.ttf').toCanvasString(20);
				let step = steps[i];
				if (step === incorrect && j === 0) step = correct.join(' ');
				let fontSize = 20;
				while (ctx.measureText(step).width > 260) {
					fontSize--;
					ctx.font = this.client.fonts.get('Noto-Regular.ttf').toCanvasString(fontSize);
				}
				ctx.strokeText(step, x, y, 260);
				ctx.fillText(step, x, y, 260);
				j++;
			}
			i++;
		}
		return msg.say({ files: [{ attachment: canvas.toBuffer('image/png'), name: 'phoebe-teaching-joey.png' }] });
	}
};
