const Command = require('../../framework/Command');
const { PermissionFlagsBits } = require('discord.js');
const path = require('path');
const { reactIfAble } = require('../../util/Util');
const fs = require('fs');
const sounds = fs.readdirSync(path.join(__dirname, '..', '..', 'assets', 'sounds', 'airhorn'));

module.exports = class AirhornCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'airhorn',
			group: 'voice',
			description: 'Plays an airhorn sound in a voice channel.',
			guildOnly: true,
			sendTyping: false,
			throttling: {
				usages: 2,
				duration: 10
			},
			userPermissions: [PermissionFlagsBits.Connect, PermissionFlagsBits.Speak],
			credit: [
				{
					name: 'Discord',
					url: 'https://discord.com/',
					reason: 'Airhorn Sounds',
					reasonURL: 'https://github.com/discord/airhornbot/tree/master/audio'
				}
			]
		});
	}

	async run(msg) {
		const connection = this.client.dispatchers.get(msg.guild.id);
		if (!connection) {
			const usage = this.client.registry.commands.get('join').usage();
			return msg.reply(`I am not in a voice channel. Use ${usage} to fix that!`);
		}
		if (!connection.canPlay) return msg.reply('I am already playing audio in this server.');
		const airhorn = sounds[Math.floor(Math.random() * sounds.length)];
		connection.play(path.join(__dirname, '..', '..', 'assets', 'sounds', 'airhorn', airhorn));
		await reactIfAble(msg, this.client.user, '🔉');
		return null;
	}
};
