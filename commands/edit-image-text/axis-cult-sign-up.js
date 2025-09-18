const Command = require('../../framework/Command');
const { PermissionFlagsBits } = require('discord.js');
const { createCanvas, loadImage } = require('@napi-rs/canvas');
const path = require('path');
const { fillTextWithBreaks } = require('../../util/Canvas');

module.exports = class AxisCultSignUpCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'axis-cult-sign-up',
			aliases: ['axis-sign-up'],
			group: 'edit-image-text',
			description: 'Sends an Axis Cult Sign-Up sheet for you. Join today!',
			throttling: {
				usages: 2,
				duration: 10
			},
			clientPermissions: [PermissionFlagsBits.AttachFiles],
			credit: [
				{
					name: 'cheesecakejedi',
					url: 'https://imgur.com/user/cheesecakejedi',
					reason: 'Image'
				},
				{
					name: 'hbl917070',
					url: 'https://github.com/hbl917070',
					reason: 'Font',
					reasonURL: 'https://github.com/hbl917070/Konosuba-text'
				},
				{
					name: 'KONOSUBA -God\'s blessing on this wonderful world!',
					url: 'http://konosuba.com/',
					reason: 'Original Anime'
				}
			],
			flags: [
				{
					key: 'english',
					description: 'Displays the text in English.'
				},
				{
					key: 'en',
					description: 'Alias for english.'
				}
			],
			args: [
				{
					key: 'gender',
					type: 'string',
					oneOf: ['male', 'female', 'other']
				},
				{
					key: 'age',
					type: 'integer',
					min: 1,
					max: 10000
				},
				{
					key: 'profession',
					type: 'string',
					max: 15
				}
			]
		});
	}

	async run(msg, { gender, age, profession, flags }) {
		const base = await loadImage(path.join(__dirname, '..', '..', 'assets', 'images', 'axis-cult-sign-up.jpg'));
		const canvas = createCanvas(base.width, base.height);
		const ctx = canvas.getContext('2d');
		ctx.drawImage(base, 0, 0);
		if (flags.english || flags.en) {
			ctx.font = this.client.fonts.get('TragicMarker.otf').toCanvasString(96);
		} else {
			ctx.font = this.client.fonts.get('Konosuba.ttf').toCanvasString(96);
		}
		ctx.fillText(msg.author.username, 960, 1558);
		ctx.fillText(gender, 960, 1752);
		ctx.fillText(age, 1700, 1752);
		ctx.fillText('XXX-XXX-XXXX', 960, 1960);
		ctx.fillText(profession, 960, 2169);
		ctx.fillText('Xiao', 960, 2370);
		if (flags.english || flags.en) {
			ctx.font = this.client.fonts.get('TragicMarker.otf').toCanvasString(123);
		} else {
			ctx.font = this.client.fonts.get('Konosuba.ttf').toCanvasString(123);
		}
		fillTextWithBreaks(ctx, 'ERIS PADS\nHER CHEST!', 1037, 2874);
		return msg.say({ files: [{ attachment: canvas.toBuffer('image/jpeg'), name: 'axis-cult-sign-up.jpg' }] });
	}
};
