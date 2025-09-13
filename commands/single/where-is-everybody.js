const Command = require('../../framework/Command');
const { PermissionFlagsBits } = require('discord.js');
const path = require('path');
const { delay } = require('../../util/Util');

module.exports = class WhereIsEverybodyCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'where-is-everybody',
			aliases: ['where-is-everyone', 'where-everybody', 'where-everyone'],
			group: 'single',
			description: 'Where is everybody?',
			throttling: {
				usages: 1,
				duration: 30
			},
			clientPermissions: [PermissionFlagsBits.AttachFiles, PermissionFlagsBits.MentionEveryone],
			userPermissions: [PermissionFlagsBits.MentionEveryone],
			credit: [
				{
					name: 'DreamWorks Animation',
					url: 'https://www.dreamworks.com/',
					reasonURL: 'https://www.dreamworks.com/movies/shrek',
					reason: 'Images, Original "Shrek" Movie'
				}
			]
		});
	}

	async run(msg) {
		await msg.channel.send({
			content: '"It\'s quiet..."',
			files: [path.join(__dirname, '..', '..', 'assets', 'images', 'where-is-everybody', 'part-1.jpg')]
		});
		await delay(5000);
		await msg.channel.send({
			content: '"Too quiet..."',
			files: [path.join(__dirname, '..', '..', 'assets', 'images', 'where-is-everybody', 'part-2.jpg')]
		});
		await delay(5000);
		return msg.channel.send({
			content: '"Where is @everyone?"',
			allowedMentions: { parse: ['everyone'] },
			files: [path.join(__dirname, '..', '..', 'assets', 'images', 'where-is-everybody', 'part-3.jpg')]
		});
	}
};
