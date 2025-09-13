const Command = require('../../framework/Command');
const { PermissionFlagsBits } = require('discord.js');
const { createCanvas, loadImage } = require('@napi-rs/canvas');
const path = require('path');
const { stripIndents } = require('common-tags');
const { shuffle, randomRange, formatTime } = require('../../util/Util');
const { drawImageWithTint } = require('../../util/Canvas');
const horses = require('../../assets/json/horse-race');
const colors = ['gold', 'silver', '#cd7f32'];

module.exports = class HorseRaceCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'horse-race',
			aliases: ['kentucky-derby'],
			group: 'games-sp',
			description: 'Bet on the fastest horse in a 6-horse race.',
			throttling: {
				usages: 2,
				duration: 10
			},
			clientPermissions: [PermissionFlagsBits.AttachFiles],
			game: true,
			credit: [
				{
					name: 'Iconian Fonts',
					url: 'https://www.fontspace.com/iconian-fonts',
					reason: 'Paladins Font',
					reasonURL: 'https://www.fontspace.com/paladins-font-f32777'
				}
			]
		});
	}

	async run(msg) {
		const chosenHorses = shuffle(horses).slice(0, 6);
		await msg.reply(stripIndents`
			**Choose a horse to bet on:** _(Type the number)_
			${chosenHorses.map((horse, i) => `**${i + 1}.** ${horse.name}`).join('\n')}
		`);
		const filter = res => {
			if (res.author.id !== msg.author.id) return false;
			const num = Number.parseInt(res.content, 10);
			if (!num) return false;
			return num > 0 && num <= chosenHorses.length;
		};
		const msgs = await msg.channel.awaitMessages({
			filter,
			max: 1,
			time: 30000
		});
		if (!msgs.size) return msg.reply('Sorry, can\'t have a race with no bets!');
		const pick = chosenHorses[Number.parseInt(msgs.first().content, 10) - 1];
		let results = [];
		for (const horse of chosenHorses) {
			results.push({
				name: horse.name,
				time: randomRange(horse.minTime, horse.minTime + 5) + Math.random()
			});
		}
		results = results.sort((a, b) => a.time - b.time);
		const leaderboard = await this.generateLeaderboard(chosenHorses, results);
		const win = results[0].name === pick.name;
		return msg.reply(win ? `Nice job! Your horse won!` : 'Better luck next time!', { files: [leaderboard] });
	}

	async generateLeaderboard(chosenHorses, results) {
		const lb = await loadImage(path.join(__dirname, '..', '..', 'assets', 'images', 'horse-race', 'leaderboard.png'));
		const horseImg = await loadImage(path.join(__dirname, '..', '..', 'assets', 'images', 'horse-race', 'horse.png'));
		const canvas = createCanvas(lb.width, lb.height);
		const ctx = canvas.getContext('2d');
		ctx.drawImage(lb, 0, 0);
		ctx.fillStyle = 'white';
		ctx.textAlign = 'center';
		ctx.textBaseline = 'middle';
		for (let i = 0; i < results.length; i++) {
			const result = results[i];
			const horse = chosenHorses.find(hor => hor.name === result.name);
			if (colors[i]) drawImageWithTint(ctx, horseImg, colors[i], 37, 114 + (49 * i), 49, 49);
			ctx.font = this.client.fonts.get('Paladins.otf').toCanvasString(34);
			ctx.fillText(formatTime(result.time), 755, 138 + (49 * i));
			ctx.font = this.client.fonts.get('Paladins.otf').toCanvasString(15);
			ctx.fillText(horse.name, 251, 138 + (49 * i));
		}
		return { attachment: canvas.toBuffer('image/png'), name: 'leaderboard.png' };
	}
};
