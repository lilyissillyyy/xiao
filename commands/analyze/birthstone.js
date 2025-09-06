const Command = require('../../framework/Command');
const { list, firstUpperCase } = require('../../util/Util');
const { months } = require('../../assets/json/month');
const stones = require('../../assets/json/birthstone');

module.exports = class BirthstoneCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'birthstone',
			group: 'analyze',
			description: 'Responds with the Birthstone for a month.',
			args: [
				{
					key: 'month',
					type: 'month'
				}
			]
		});
	}

	run(msg, { month }) {
		const stone = stones[month - 1];
		const alternate = stone.alternate ? ` Alternatively, you can also use **${list(stone.alternate, 'or')}**.` : '';
		return msg.say(`The Birthstone for ${firstUpperCase(months[month - 1])} is **${stone.primary}**.${alternate}`);
	}
};
