const Command = require('../../framework/Command');

module.exports = class HexCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'hex',
			aliases: ['hexidecimal'],
			group: 'edit-text',
			description: 'Converts text to hex.',
			args: [
				{
					key: 'text',
					type: 'string',
					validate: text => {
						if (Buffer.from(text).toString('hex').length < 2000) return true;
						return 'Invalid text, your text is too long.';
					}
				}
			]
		});
	}

	run(msg, { text }) {
		return msg.say(Buffer.from(text).toString('hex'));
	}
};
