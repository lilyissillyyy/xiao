const Command = require('../../framework/Command');
const { PermissionFlagsBits } = require('discord.js');
const { createCanvas } = require('@napi-rs/canvas');
const ntc = require('ntcjs');

module.exports = class ColorCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'color',
			aliases: ['colour'],
			group: 'edit-image',
			description: 'Sends an image of the color you choose.',
			throttling: {
				usages: 2,
				duration: 10
			},
			clientPermissions: [PermissionFlagsBits.AttachFiles],
			args: [
				{
					key: 'color',
					type: 'string',
					validate: color => /^#[0-9A-F]{6}$/i.test(color)
				}
			]
		});
	}

	run(msg, { color }) {
		const canvas = createCanvas(250, 250);
		const ctx = canvas.getContext('2d');
		const name = ntc.name(color);
		ctx.fillStyle = color.toLowerCase();
		ctx.fillRect(0, 0, 250, 250);
		return msg.say(`${color.toUpperCase()} - ${name[1]}`, {
			files: [{ attachment: canvas.toBuffer('image/png'), name: 'color.png' }]
		});
	}
};
