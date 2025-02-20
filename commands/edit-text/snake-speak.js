const Command = require('../../framework/Command');

module.exports = class SnakeSpeakCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'snake-speak',
			aliases: ['snek-speak'],
			group: 'edit-text',
			description: 'Convertsssss text to sssssnake ssssspeak.',
			args: [
				{
					key: 'text',
					type: 'string',
					validate: text => {
						if (text.replace(/s/gi, 'sssss').length < 2000) return true;
						return 'Invalid text, your text is too long.';
					}
				}
			]
		});
	}

	run(msg, { text }) {
		return msg.say(text.replaceAll('s', 'sssss').replaceAll('S', 'SSSSS'));
	}
};
