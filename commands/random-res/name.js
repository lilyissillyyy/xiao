const Command = require('../../framework/Command');
const request = require('node-superfetch');
const genders = {
	masculine: 'male',
	feminine: 'female',
	any: ''
};

module.exports = class NameCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'name',
			group: 'random-res',
			description: 'Responds with a random name, with the gender of your choice.',
			credit: [
				{
					name: 'Random User Generator',
					url: 'https://randomuser.me/',
					reason: 'API',
					reasonURL: 'https://randomuser.me/documentation'
				}
			],
			args: [
				{
					key: 'gender',
					type: 'string',
					default: 'both',
					oneOf: Object.keys(genders),
					parse: gender => gender.toLowerCase()
				}
			]
		});
	}

	async run(msg, { gender }) {
		const { body } = await request
			.get('https://randomuser.me/api/')
			.query({
				inc: 'name',
				noinfo: '',
				gender: genders[gender],
				nat: 'AU,US,CA,GB'
			});
		const data = body.results[0].name;
		return msg.say(`${data.first} ${data.last}`);
	}
};
