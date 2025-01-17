const Command = require('../../framework/Command');
const { formatNumber } = require('../../util/Util');

module.exports = class TaxCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'tax',
			group: 'edit-number',
			description: 'Determines the total cost of something plus tax.',
			args: [
				{
					key: 'rate',
					type: 'integer',
					max: 100,
					min: 0
				},
				{
					key: 'amount',
					type: 'float'
				}
			]
		});
	}

	run(msg, { rate, amount }) {
		const result = amount + ((rate / 100) * amount);
		return msg.reply(`$${formatNumber(result, 2)}`);
	}
};
