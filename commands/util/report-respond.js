const Command = require('../../framework/Command');
const { EmbedBuilder } = require('discord.js');
const types = ['reject', 'info', 'approve'];
const typesColors = ['Red', 'Yellow', 'Green'];
const displaytypes = ['❌ Rejected', '❓ Need More Info', '✅ Accepted/Fixed'];

module.exports = class ReportRespondCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'report-respond',
			aliases: ['report-res'],
			group: 'util',
			description: 'Responds to a submitted report.',
			details: 'Only the bot owner(s) may use this command.',
			guarded: true,
			ownerOnly: true,
			args: [
				{
					key: 'user',
					type: 'user'
				},
				{
					key: 'type',
					type: 'string',
					oneOf: types,
					parse: type => types.indexOf(type.toLowerCase())
				},
				{
					key: 'message',
					type: 'string'
				}
			]
		});
	}

	async run(msg, { user, type, message }) {
		const embed = new EmbedBuilder()
			.setDescription(message)
			.setTitle(displaytypes[type])
			.setAuthor({ name: msg.author.tag })
			.setFooter({ text: `ID: ${msg.author.id}` })
			.setTimestamp()
			.setColor(typesColors[type]);
		try {
			await user.send({
				content: 'Your report has been evaluated with the following message:',
				embeds: [embed]
			});
			return msg.say(`${displaytypes[type]} sent to ${user.tag}.`);
		} catch {
			return msg.say(`Could not send ${displaytypes[type]} to ${user.tag}. Probably blocked me.`);
		}
	}
};
