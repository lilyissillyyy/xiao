const Command = require('../../framework/Command');
const { stripIndents } = require('common-tags');
const { verify, list } = require('../../util/Util');
const colors = require('../../assets/json/domineering');
const blankEmoji = '⬜';
const nums = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟'];
const turnRegex = /^(\d+), ?(\d+)/i;

module.exports = class DomineeringCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'domineering',
			aliases: ['domineer', 'cross-cram', 'stop-gate'],
			group: 'games-mp',
			description: 'Play a game of Domineering with another user.',
			guildOnly: true,
			game: true,
			args: [
				{
					key: 'opponent',
					type: 'user'
				},
				{
					key: 'color',
					type: 'string',
					oneOf: Object.keys(colors),
					parse: color => color.toLowerCase()
				},
				{
					key: 'size',
					type: 'integer',
					min: 3,
					max: 10,
					default: 5
				}
			]
		});
	}

	async run(msg, { opponent, color, size }) {
		if (opponent.bot) return msg.reply('Bots may not be played against.');
		if (opponent.id === msg.author.id) return msg.reply('You may not play against yourself.');
		if (this.client.blacklist.user.includes(opponent.id)) return msg.reply('This user is blacklisted.');
		const userEmoji = colors[color];
		let oppoEmoji = userEmoji === colors.blue ? colors.red : colors.blue;
		const available = Object.keys(colors).filter(clr => color !== clr);
		await msg.say(`${opponent}, do you accept this challenge?`);
		const verification = await verify(msg.channel, opponent);
		if (!verification) return msg.say('Looks like they declined...');
		await msg.say(`${opponent}, what color do you want to be? Either ${list(available, 'or')}.`);
		const filter = res => {
			if (res.author.id !== opponent.id) return false;
			return available.includes(res.content.toLowerCase());
		};
		const p2Color = await msg.channel.awaitMessages({
			filter,
			max: 1,
			time: 30000
		});
		if (p2Color.size) oppoEmoji = colors[p2Color.first().content.toLowerCase()];
		const board = this.generateBoard(size);
		let userTurn = true;
		let winner = null;
		let lastTurnTimeout = false;
		while (!winner) {
			const user = userTurn ? msg.author : opponent;
			await msg.say(stripIndents`
				${user}, at what coordinates do you want to place your block (ex. 1,1)? Type \`end\` to forfeit.
				Your pieces are **${userTurn ? 'vertical' : 'horizontal'}**.

				${this.displayBoard(board, userEmoji, oppoEmoji)}
			`);
			const possibleMoves = this.possibleMoves(board, userTurn);
			const colorFilter = res => {
				if (res.author.id !== user.id) return false;
				const pick = res.content;
				if (pick.toLowerCase() === 'end') return true;
				const coordPicked = pick.match(turnRegex);
				if (!coordPicked) return false;
				const x = Number.parseInt(coordPicked[1], 10);
				const y = Number.parseInt(coordPicked[2], 10);
				if (x > size || y > size || x < 1 || y < 1) return false;
				if (!possibleMoves.includes(`${x - 1},${y - 1}`)) return false;
				return true;
			};
			const turn = await msg.channel.awaitMessages({
				filter: colorFilter,
				max: 1,
				time: 60000
			});
			if (!turn.size) {
				await msg.say('Sorry, time is up!');
				if (lastTurnTimeout) {
					winner = 'time';
					break;
				} else {
					lastTurnTimeout = true;
					userTurn = !userTurn;
					continue;
				}
			}
			const choice = turn.first().content;
			if (choice.toLowerCase() === 'end') {
				winner = userTurn ? opponent : msg.author;
				break;
			}
			const matched = choice.match(turnRegex);
			const x = Number.parseInt(matched[1], 10);
			const y = Number.parseInt(matched[2], 10);
			board[y - 1][x - 1] = userTurn ? 'U' : 'O';
			board[userTurn ? y : y - 1][userTurn ? x - 1 : x] = userTurn ? 'U' : 'O';
			userTurn = !userTurn;
			if (lastTurnTimeout) lastTurnTimeout = false;
			const oppoPossible = this.possibleMoves(board, userTurn);
			if (!oppoPossible.length) {
				winner = userTurn ? opponent : msg.author;
				break;
			}
		}
		if (winner === 'time') return msg.say('Game ended due to inactivity.');
		return msg.say(stripIndents`
			Congrats, ${winner}! Your opponent has no possible moves left!

			${this.displayBoard(board, userEmoji, oppoEmoji)}
		`);
	}

	possibleMoves(board, userTurn) {
		const possibleMoves = [];
		for (let i = 0; i < board.length; i++) {
			for (let j = 0; j < board[i].length; j++) {
				if (board[i][j]) continue;
				if (userTurn && !board[i + 1]) continue;
				if (!userTurn && board[i][j + 1] === undefined) continue;
				if (board[userTurn ? i + 1 : i][userTurn ? j : j + 1]) continue;
				possibleMoves.push(`${j},${i}`);
			}
		}
		return possibleMoves;
	}

	generateBoard(size) {
		const arr = [];
		for (let i = 0; i < size; i++) {
			const row = [];
			for (let j = 0; j < size; j++) row.push(null);
			arr.push(row);
		}
		return arr;
	}

	displayBoard(board, userColor, oppoColor) {
		let str = '';
		str += '⬛';
		str += nums.slice(0, board.length).join('');
		str += '\n';
		for (let i = 0; i < board.length; i++) {
			str += nums[i];
			board[i].forEach(item => {
				if (item === 'U') str += userColor;
				else if (item === 'O') str += oppoColor;
				else str += blankEmoji;
			});
			str += '\n';
		}
		return str;
	}
};
