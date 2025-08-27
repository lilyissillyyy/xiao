const Command = require('../../framework/Command');
const request = require('node-superfetch');

module.exports = class BoredomCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'boredom',
			aliases: ['bored'],
			group: 'random-res',
			description: 'Responds with a random activity to try when you\'re bored.',
			credit: [
				{
					name: 'Bored API',
					url: 'https://bored.api.lewagon.com/',
					reason: 'API'
				}
			]
		});
	}

	async run(msg) {
		const { body } = await request.get('https://bored.api.lewagon.com/api/activity/');
		return msg.say(`${body.activity} (${body.type})`);
	}
};
