const Command = require('../../framework/Command');
const request = require('node-superfetch');
const { createCanvas, loadImage } = require('@napi-rs/canvas');
const path = require('path');
const { reactIfAble } = require('../../util/Util');
const { wrapText } = require('../../util/Canvas');

module.exports = class JeopardyCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'jeopardy',
			group: 'games-sp',
			description: 'Answer a Jeopardy question.',
			throttling: {
				usages: 2,
				duration: 10
			},
			game: true,
			credit: [
				{
					name: 'J! Archive',
					url: 'https://j-archive.com/index.php',
					reason: 'Clue Data'
				},
				{
					name: 'Jeopardy',
					url: 'https://www.jeopardy.com/',
					reason: 'Music, Original Show'
				},
				{
					name: 'OPTIFONT',
					url: 'http://opti.netii.net/',
					reason: 'Korinna Agency Font',
					reasonURL: 'https://fontmeme.com/fonts/korinna-agency-font/'
				},
				{
					name: 'DrewManDew',
					url: 'https://www.deviantart.com/drewmandew/gallery',
					reason: 'Blank Background Image',
					reasonURL: 'https://www.deviantart.com/drewmandew/art/Blank-Jeopardy-Screen-780893853'
				}
			]
		});
	}

	async run(msg) {
		const question = this.client.jeopardy.clues[Math.floor(Math.random() * this.client.jeopardy.clues.length)];
		const clueCard = await this.generateClueCard(question.question.replace(/<\/?i>/gi, ''));
		const connection = msg.guild ? this.client.dispatchers.get(msg.guild.id) : null;
		let playing = false;
		if (msg.guild && connection && connection.canPlay) {
			playing = true;
			connection.play(path.join(__dirname, '..', '..', 'assets', 'sounds', 'jeopardy.mp3'));
			await reactIfAble(msg, this.client.user, '🔉');
		}
		const category = question.category ? question.category.toUpperCase() : '';
		await msg.reply(`${category ? `The category is: **${category}**. ` : ''}30 seconds, good luck.`, {
			files: [{ attachment: clueCard, name: 'clue-card.png' }]
		});
		const msgs = await msg.channel.awaitMessages({
			filter: res => res.author.id === msg.author.id,
			max: 1,
			time: 30000
		});
		if (playing) connection.stop();
		const answer = question.answer.replace(/<\/?i>/gi, '*').replace(/\(|\)/g, '');
		if (!msgs.size) return msg.reply(`Time's up, the answer was **${answer}**.`);
		const win = msgs.first().content.toLowerCase() === answer.toLowerCase();
		if (!win) return msg.reply(`The answer was **${answer}**.`);
		return msg.reply(`The answer was **${answer}**. Good job!`);
	}

	async generateClueCard(question) {
		const bg = await loadImage(path.join(__dirname, '..', '..', 'assets', 'images', 'jeopardy.png'));
		const canvas = createCanvas(1280, 720);
		const ctx = canvas.getContext('2d');
		ctx.drawImage(bg, 0, 0);
		ctx.textAlign = 'center';
		ctx.textBaseline = 'top';
		ctx.fillStyle = 'white';
		ctx.font = this.client.fonts.get('OPTIKorinna-Agency.otf').toCanvasString(62);
		const lines = wrapText(ctx, question.toUpperCase(), 813);
		const topMost = (canvas.height / 2) - (((52 * lines.length) / 2) + ((20 * (lines.length - 1)) / 2));
		for (let i = 0; i < lines.length; i++) {
			const height = topMost + ((52 + 20) * i);
			ctx.fillStyle = 'black';
			ctx.fillText(lines[i], (canvas.width / 2) + 3, height + 3);
			ctx.fillStyle = 'white';
			ctx.fillText(lines[i], canvas.width / 2, height);
		}
		return canvas.toBuffer('image/png');
	}
};
