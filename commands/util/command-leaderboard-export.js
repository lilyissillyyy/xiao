const Command = require('../../framework/Command');

module.exports = class CommandLeaderboardExportCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'command-leaderboard-export',
			aliases: [
				'cmd-lb-export',
				'cmd-leaderboard-export',
				'command-lb-export',
				'export-cmd-lb',
				'export-cmd-leaderboard',
				'export-command-lb',
				'export-command-leaderboard'
			],
			group: 'util',
			description: 'Exports a command leaderboard JSON file.',
			details: 'Only the bot owner(s) may use this command.',
			ownerOnly: true,
			guarded: true
		});
	}

	async run(msg) {
		const result = this.client.exportCommandLeaderboard();
		if (msg.guild) await msg.say('📬 Sent `command-leaderboard.json` to your DMs!');
		return msg.direct({ files: [{ attachment: result, name: 'command-leaderboard.json' }] });
	}
};
