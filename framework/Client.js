const { Client, PermissionFlagsBits } = require('discord.js');
const { Collection } = require('@discordjs/collection');
const fs = require('fs');
const path = require('path');
const { stripIndents } = require('common-tags');
const Registry = require('./Registry');
const Dispatcher = require('./Dispatcher');
require('./Extensions');

module.exports = class CommandClient extends Client {
	constructor(options) {
		super(options);

		this.commandPrefix = options.commandPrefix;
		this.mentionPrefix = typeof options.mentionPrefix === 'undefined' ? true : Boolean(options.mentionPrefix);
		this.owner = typeof options.owner === 'string' ? [options.owner] : options.owner;
		this.invite = options.invite || null;
		this.registry = new Registry(this);
		this.dispatcher = new Dispatcher(this);
		this.games = new Collection();
		this.blacklist = { user: [], guild: [] };
		this._throttlingTimeouts = new Map();

		this.once('clientReady', this.onceReady);
		this.on('messageCreate', this.onMessage);
	}

	isOwner(user) {
		return this.owner.includes(user.id);
	}

	async onceReady() {
		for (const owner of this.owner) {
			await this.users.fetch(owner);
		}
	}

	async onMessage(msg) {
		if (!msg.author) return;

		if (msg.channel.partial) msg.channel = await this.channels.fetch(msg.channel.id);
		if (msg.partial) msg = await msg.channel.messages.fetch({ message: msg.id });
		if (msg.guild && (!msg.member || msg.member.partial || !msg.guild.members.cache.has(msg.author.id))) {
			try {
				await msg.guild.members.fetch(msg.author.id);
			} catch {
				// Ignore
			}
		}

		if (msg.author.bot) return;
		if (this.blacklist.user.includes(msg.author.id)) return;
		if (msg.guild && this.blacklist.guild.includes(msg.guild.id)) return;
		if (msg.guild && !msg.channel.permissionsFor(this.user).has(PermissionFlagsBits.SendMessages)) return;

		const patternCmd = this.dispatcher.isPatternCommand(msg);
		if (patternCmd) {
			try {
				const result = await patternCmd.run(msg);
				patternCmd.uses++;
				patternCmd.lastRun = new Date();
				this.emit('commandRun', patternCmd, result, msg);
			} catch (err) {
				this.emit('commandError', patternCmd, err, msg);
				await msg.reply(stripIndents`
					An error occurred while running this command: \`${err.message}\`.
					You shouldn't ever recieve an error like this.
					${this.invite ? `Please visit ${this.invite} for support.` : 'Please pray to any god that listens.'}
				`);
			}
		}

		if (!this.dispatcher.isCommand(msg)) return;
		const parsed = await this.dispatcher.parseMessage(msg);
		if (parsed.error) {
			await msg.channel.sendTyping();
			const helpUsage = this.registry.commands.get('help').usage(parsed.command.name);
			await msg.reply(stripIndents`
				${parsed.error}

				Use ${helpUsage} for more information.
				Example: ${parsed.command.example(msg)}
			`);
			return;
		}
		const { command, args } = parsed;
		if (command.sendTyping) await msg.channel.sendTyping();
		if (msg.guild && command.clientPermissions.length) {
			for (const permission of command.clientPermissions) {
				if (msg.channel.permissionsFor(this.user).has(permission)) continue;
				await msg.reply('Looks like I\'m missing the permissions required for this command.');
				return;
			}
		}
		if (command.guildOnly && !msg.guild) {
			await msg.reply(`The \`${command.name}\` command can only be used in a server channel.`);
			return;
		}
		if (!this.isOwner(msg.author)) {
			if (!command._enabled) {
				await msg.reply(`The \`${command.name}\` command is disabled.`);
				return;
			}
			if (command.ownerOnly) {
				await msg.reply(`The \`${command.name}\` command can only be used by the bot owner.`);
				return;
			}
			if (command.nsfw && !msg.channel.nsfw) {
				await msg.reply(`The \`${command.name}\` command can only be used in NSFW channels.`);
				return;
			}
			if (msg.guild && command.userPermissions.length) {
				for (const permission of command.userPermissions) {
					if (msg.channel.permissionsFor(msg.author).has(permission)) continue;
					await msg.reply(`You do not have the required permissions to use the \`${command.name}\` command.`);
					return;
				}
			}
			const throttleAmount = command.throttles.get(msg.author.id);
			if (throttleAmount && throttleAmount.usages >= command.throttling.usages) {
				const timeLeft = Math.round((throttleAmount.timeFinish - Date.now()) / 1000);
				await msg.reply(`Please wait ${timeLeft} seconds before using the \`${command.name}\` command again.`);
				return;
			}
			command.throttles.set(msg.author.id, {
				usages: (throttleAmount?.usages || 0) + 1,
				timeFinish: Date.now() + (command.throttling.duration * 1000)
			});
			if (!throttleAmount) {
				const timeout = setTimeout(() => command.throttles.delete(msg.author.id), command.throttling.duration * 1000);
				command._timeouts.set(msg.author.id, timeout);
			}
		}
		try {
			if (command.game) {
				const current = this.games.get(msg.channel.id);
				if (current) {
					await msg.reply(`Please wait until the current game of \`${current.name}\` is finished.`);
					return;
				}
				this.games.set(msg.channel.id, { name: command.name });
			}
			const result = await command.run(msg, args);
			if (command.game) this.games.delete(msg.channel.id);
			command.uses++;
			command.lastRun = new Date();
			this.emit('commandRun', command, result, msg, args);
		} catch (err) {
			if (command.game) this.games.delete(msg.channel.id);
			this.emit('commandError', command, err, msg, args);
			await msg.reply(stripIndents`
				An error occurred while running this command: \`${err.message}\`.
				You shouldn't ever recieve an error like this.
				${this.invite ? `Please visit ${this.invite} for support.` : 'Please pray to any god that listens.'}
			`);
		}
	}

	importBlacklist() {
		const read = fs.readFileSync(path.join(__dirname, '..', 'blacklist.json'), { encoding: 'utf8' });
		const file = JSON.parse(read);
		if (typeof file !== 'object' || Array.isArray(file)) return null;
		if (!file.guild || !file.user) return null;
		for (const id of file.guild) {
			if (typeof id !== 'string') continue;
			if (this.blacklist.guild.includes(id)) continue;
			this.blacklist.guild.push(id);
		}
		for (const id of file.user) {
			if (typeof id !== 'string') continue;
			if (this.blacklist.user.includes(id)) continue;
			this.blacklist.user.push(id);
		}
		return file;
	}

	exportBlacklist() {
		let text = '{\n	"guild": [\n		';
		if (this.blacklist.guild.length) {
			for (const id of this.blacklist.guild) {
				text += `"${id}",\n		`;
			}
			text = text.slice(0, -4);
		}
		text += '\n	],\n	"user": [\n		';
		if (this.blacklist.user.length) {
			for (const id of this.blacklist.user) {
				text += `"${id}",\n		`;
			}
			text = text.slice(0, -4);
		}
		text += '\n	]\n}\n';
		const buf = Buffer.from(text);
		fs.writeFileSync(path.join(__dirname, '..', 'blacklist.json'), buf, { encoding: 'utf8' });
		return buf;
	}

	importCommandLeaderboard(add = false) {
		const read = fs.readFileSync(path.join(__dirname, '..', 'command-leaderboard.json'), {
			encoding: 'utf8'
		});
		const file = JSON.parse(read);
		if (typeof file !== 'object' || Array.isArray(file)) return null;
		for (const [id, value] of Object.entries(file)) {
			if (typeof value !== 'number') continue;
			const found = this.registry.commands.get(id);
			if (!found || found.uses === undefined) continue;
			if (add) found.uses += value;
			else found.uses = value;
		}
		return file;
	}

	exportCommandLeaderboard() {
		let text = '{';
		for (const command of this.registry.commands.values()) {
			if (command.unknown) continue;
			if (command.uses === undefined) continue;
			text += `\n	"${command.name}": ${command.uses},`;
		}
		text = text.slice(0, -1);
		text += '\n}\n';
		const buf = Buffer.from(text);
		fs.writeFileSync(path.join(__dirname, '..', 'command-leaderboard.json'), buf, {
			encoding: 'utf8'
		});
		return buf;
	}

	importLastRun() {
		const read = fs.readFileSync(path.join(__dirname, '..', 'command-last-run.json'), {
			encoding: 'utf8'
		});
		const file = JSON.parse(read);
		if (typeof file !== 'object' || Array.isArray(file)) return null;
		for (const [id, value] of Object.entries(file)) {
			if (!value) continue;
			const date = new Date(value);
			if (date.toString() === 'Invalid Date') continue;
			const found = this.registry.commands.get(id);
			if (!found || found.lastRun === undefined) continue;
			found.lastRun = date;
		}
		return file;
	}

	exportLastRun() {
		let text = '{';
		for (const command of this.registry.commands.values()) {
			if (command.unknown) continue;
			if (command.lastRun === undefined) continue;
			text += `\n	"${command.name}": ${command.lastRun ? `"${command.lastRun.toISOString()}"` : null},`;
		}
		text = text.slice(0, -1);
		text += '\n}\n';
		const buf = Buffer.from(text);
		fs.writeFileSync(path.join(__dirname, '..', 'command-last-run.json'), buf, {
			encoding: 'utf8'
		});
		return buf;
	}
};
