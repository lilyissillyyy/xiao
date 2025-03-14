const { ActionRowBuilder, ButtonBuilder, PermissionFlagsBits, ButtonStyle, ComponentType } = require('discord.js');
const crypto = require('crypto');
const request = require('node-superfetch');
const fs = require('fs');
let parseDomain;
let ParseResultType;
import('parse-domain').then(loadedModule => {
	parseDomain = loadedModule.parseDomain;
	ParseResultType = loadedModule.ParseResultType;
});
const { decode: decodeHTML } = require('html-entities');
const { stripIndents } = require('common-tags');
const { URL } = require('url');
const yes = ['yes', 'y', 'ye', 'yeah', 'yup', 'yea', 'ya', 'hai', 'si', 'sí', 'oui', 'はい', 'correct'];
const no = ['no', 'n', 'nah', 'nope', 'nop', 'iie', 'いいえ', 'non', 'fuck off'];
const inviteRegex = /(https?:\/\/)?(www\.|canary\.|ptb\.)?discord(\.gg|(app)?\.com\/invite|\.me)\/([^ ]+)\/?/gi;
const botInvRegex = /(https?:\/\/)?(www\.|canary\.|ptb\.)?discord(app)?\.com\/(api\/)?oauth2\/authorize\?([^ ]+)\/?/gi;

module.exports = class Util {
	static delay(ms) {
		return new Promise(resolve => setTimeout(resolve, ms));
	}

	static escapeRegex(str) {
		return str.replace(/[|\\{}()[\]^$+*?.]/g, '\\$&');
	}

	static shuffle(array) {
		const arr = array.slice(0);
		for (let i = arr.length - 1; i >= 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			const temp = arr[i];
			arr[i] = arr[j];
			arr[j] = temp;
		}
		return arr;
	}

	static list(arr, conj = 'and') {
		const len = arr.length;
		if (len === 0) return '';
		if (len === 1) return arr[0];
		return `${arr.slice(0, -1).join(', ')}${len > 1 ? `${len > 2 ? ',' : ''} ${conj} ` : ''}${arr.slice(-1)}`;
	}

	static shorten(text, maxLen = 2000) {
		return text.length > maxLen ? `${text.substr(0, maxLen - 3)}...` : text;
	}

	static randomRange(min, max) {
		return Math.floor(Math.random() * (max - min + 1)) + min;
	}

	static trimArray(arr, maxLen = 10) {
		if (arr.length > maxLen) {
			const len = arr.length - maxLen;
			arr = arr.slice(0, maxLen);
			arr.push(`${len} more...`);
		}
		return arr;
	}

	static removeFromArray(arr, value) {
		const index = arr.indexOf(value);
		if (index > -1) return arr.splice(index, 1);
		return arr;
	}

	static removeAllFromArray(arr, value) {
		return arr.filter(i => i !== value);
	}

	static removeDuplicates(arr) {
		if (arr.length === 0 || arr.length === 1) return arr;
		const newArr = [];
		for (let i = 0; i < arr.length; i++) {
			if (newArr.includes(arr[i])) continue;
			newArr.push(arr[i]);
		}
		return newArr;
	}

	static arrayEquals(a, b) {
		return Array.isArray(a) && Array.isArray(b) && a.length === b.length && a.every((val, i) => val === b[i]);
	}

	static sortByName(arr, prop) {
		return arr.sort((a, b) => {
			if (prop) return a[prop].toLowerCase() > b[prop].toLowerCase() ? 1 : -1;
			return a.toLowerCase() > b.toLowerCase() ? 1 : -1;
		});
	}

	static firstUpperCase(text, split = ' ') {
		return text.split(split).map(word => `${word.charAt(0).toUpperCase()}${word.slice(1)}`).join(' ');
	}

	static formatNumber(number, minimumFractionDigits = 0) {
		return Number.parseFloat(number).toLocaleString(undefined, {
			minimumFractionDigits,
			maximumFractionDigits: 2
		});
	}

	static formatNumberK(number) {
		if (number > 999999999) return `${(number / 1000000000).toLocaleString(undefined, { maximumFractionDigits: 1 })}B`;
		if (number > 999999) return `${(number / 1000000).toLocaleString(undefined, { maximumFractionDigits: 1 })}M`;
		if (number > 999) return `${(number / 1000).toLocaleString(undefined, { maximumFractionDigits: 1 })}K`;
		return number;
	}

	static formatTime(time) {
		const min = Math.floor(time / 60);
		const sec = Math.floor(time - (min * 60));
		const ms = time - sec - (min * 60);
		return `${min}:${sec.toString().padStart(2, '0')}.${ms.toFixed(4).slice(2)}`;
	}

	static base64(text, mode = 'encode') {
		if (mode === 'encode') return Buffer.from(text).toString('base64');
		if (mode === 'decode') return Buffer.from(text, 'base64').toString('utf8') || null;
		throw new TypeError(`${mode} is not a supported base64 mode.`);
	}

	static hash(text, algorithm) {
		return crypto.createHash(algorithm).update(text).digest('hex');
	}

	static gcd(a, b) {
		if (b > a) {
			const temp = a;
			a = b;
			b = temp;
		}
		while (b !== 0) {
			const m = a % b;
			a = b;
			b = m;
		}
		return a;
	}

	static percentColor(pct, percentColors) {
		let i = 1;
		for (i; i < percentColors.length - 1; i++) {
			if (pct < percentColors[i].pct) {
				break;
			}
		}
		const lower = percentColors[i - 1];
		const upper = percentColors[i];
		const range = upper.pct - lower.pct;
		const rangePct = (pct - lower.pct) / range;
		const pctLower = 1 - rangePct;
		const pctUpper = rangePct;
		const color = {
			r: Math.floor((lower.color.r * pctLower) + (upper.color.r * pctUpper)).toString(16).padStart(2, '0'),
			g: Math.floor((lower.color.g * pctLower) + (upper.color.g * pctUpper)).toString(16).padStart(2, '0'),
			b: Math.floor((lower.color.b * pctLower) + (upper.color.b * pctUpper)).toString(16).padStart(2, '0')
		};
		return `#${color.r}${color.g}${color.b}`;
	}

	static today(timeZone) {
		const now = new Date();
		now.setHours(0);
		now.setMinutes(0);
		now.setSeconds(0);
		now.setMilliseconds(0);
		if (timeZone) now.setUTCHours(now.getUTCHours() + timeZone);
		return now;
	}

	static tomorrow(timeZone) {
		const today = Util.today(timeZone);
		today.setDate(today.getDate() + 1);
		return today;
	}

	static isLeap(year) {
		return ((year % 4 === 0) && (year % 100 !== 0)) || (year % 400 === 0);
	}

	static rgbToHex(r, g, b) {
		if (r > 255 || g > 255 || b > 255) return null;
		return ((r << 16) | (g << 8) | b).toString(16);
	}

	static magikToBuffer(magik) {
		return new Promise((res, rej) => {
			magik.toBuffer((err, buffer) => {
				if (err) return rej(err);
				return res(buffer);
			});
		});
	}

	static embedURL(title, uri, display) {
		return `[${title}](${uri.replaceAll(')', '%29')}${display ? ` "${display}"` : ''})`;
	}

	static checkFileExists(filepath) {
		return new Promise(res => fs.access(filepath, fs.constants.F_OK, error => res(!error)));
	}

	static stripInvites(str, { guild = true, bot = true, text = '[redacted invite]' } = {}) {
		if (!str) return '';
		if (guild) str = str.replace(inviteRegex, text);
		if (bot) str = str.replace(botInvRegex, text);
		return str;
	}

	static preventURLEmbeds(str) {
		return str.replace(/(https?:\/\/\S+)/g, '<$1>');
	}

	static async isUrlNSFW(uri, siteList) {
		if (!parseDomain || !ParseResultType) throw new Error('parse-domain still loading');
		const parsed = new URL(uri);
		const { type, domain, topLevelDomains } = parseDomain(parsed.hostname);
		if (type !== ParseResultType.Listed) return null;
		if (siteList.includes(`${domain}.${topLevelDomains.join('.')}`)) return true;
		let redirectURL;
		try {
			const { url: redirected } = await request.get(uri, { noResultData: true });
			redirectURL = redirected;
		} catch {
			return null;
		}
		const parsedRedirect = new URL(redirectURL);
		const { type: reType, domain: reDomain, topLevelDomains: reTop } = parseDomain(parsedRedirect.hostname);
		if (reType !== ParseResultType.Listed) return null;
		if (siteList.includes(`${reDomain}.${reTop.join('.')}`)) return true;
		return false;
	}

	static stripNSFWURLs(str, siteList, text = '[redacted nsfw url]') {
		if (!parseDomain || !ParseResultType) throw new Error('parse-domain still loading');
		if (!str) return '';
		const uris = str.match(/(https?:\/\/\S+)/g);
		if (!uris) return str;
		for (const uri of uris) {
			const parsed = new URL(uri);
			const { type, domain, topLevelDomains } = parseDomain(parsed.hostname);
			if (type !== ParseResultType.Listed) continue;
			if (!siteList.includes(`${domain}.${topLevelDomains.join('.')}`)) continue;
			str = str.replace(uri, text);
		}
		return str;
	}

	static async reactIfAble(msg, user, emoji, fallbackEmoji) {
		const dm = !msg.guild;
		if (!emoji) emoji = fallbackEmoji;
		if (fallbackEmoji && (!dm && !msg.channel.permissionsFor(user).has(PermissionFlagsBits.UseExternalEmojis))) {
			emoji = fallbackEmoji;
		}
		const perms = [PermissionFlagsBits.AddReactions, PermissionFlagsBits.ReadMessageHistory];
		if (dm || msg.channel.permissionsFor(user).has(perms)) {
			try {
				await msg.react(emoji);
			} catch {
				return null;
			}
		}
		return null;
	}

	static async verify(channel, user, { time = 30000, extraYes = [], extraNo = [] } = {}) {
		const filter = res => {
			const value = res.content.toLowerCase();
			return (user ? res.author.id === user.id : true)
				&& (yes.includes(value) || no.includes(value) || extraYes.includes(value) || extraNo.includes(value));
		};
		const verify = await channel.awaitMessages({
			filter,
			max: 1,
			time
		});
		if (!verify.size) return 0;
		const choice = verify.first().content.toLowerCase();
		if (yes.includes(choice) || extraYes.includes(choice)) return true;
		if (no.includes(choice) || extraNo.includes(choice)) return false;
		return false;
	}

	static async pickWhenMany(msg, arr, defalt, arrListFunc, { time = 30000 } = {}) {
		const resultsList = arr.map(arrListFunc);
		await msg.reply(stripIndents`
			__**Found ${arr.length} results, which would you like to view?**__
			${resultsList.join('\n')}
		`);
		const filter = res => {
			if (res.author.id !== msg.author.id) return false;
			const num = Number.parseInt(res.content, 10);
			if (!num) return false;
			return num > 0 && num <= arr.length;
		};
		const msgs = await msg.channel.awaitMessages({ filter, max: 1, time });
		if (!msgs.size) return defalt;
		return arr[Number.parseInt(msgs.first().content, 10) - 1];
	}

	static async awaitPlayers(msg, max, min, blacklist) {
		if (max === 1) return [msg.author.id];
		const addS = min - 1 === 1 ? '' : 's';
		const row = new ActionRowBuilder().addComponents(
			new ButtonBuilder().setCustomId('join').setLabel('Join Game').setStyle(ButtonStyle.Primary),
			new ButtonBuilder().setCustomId('start').setLabel('Start Game').setStyle(ButtonStyle.Success)
		);
		let text = stripIndents`
			You will need at least ${min - 1} more player${addS} (at max ${max - 1}).
			As the host, ${msg.author}, you can start the game early.
		`;
		text += '\n\n';
		const initialMsg = await msg.say(text, { components: [row] });
		const joined = [];
		joined.push(msg.author.id);
		const filter = interaction => {
			if (interaction.user.bot) return false;
			if (blacklist.includes(interaction.user.id)) return false;
			if (interaction.customId === 'start') {
				if (interaction.user.id !== msg.author.id) return false;
				return true;
			}
			if (joined.includes(interaction.user.id)) return false;
			return true;
		};
		const collector = msg.channel.createMessageComponentCollector({
			filter,
			componentType: ComponentType.Button,
			max: max - 1,
			time: 120000
		});
		collector.on('collect', interaction => {
			if (interaction.customId === 'start') {
				interaction.deferUpdate();
				collector.stop();
				return;
			}
			joined.push(interaction.user.id);
			if (joined.length === max) return;
			text += `${interaction.user.tag} is in!\n`;
			interaction.update(text);
		});
		return new Promise(res => {
			collector.once('end', () => {
				if (joined.length < min) {
					initialMsg.edit({ content: 'Failed to start the game.', components: [] });
					return res(false);
				}
				initialMsg.edit({ content: 'Let the game begin!', components: [] });
				return res(joined);
			});
		});
	}

	static async fetchHSUserDisplay(client, userID) {
		let user;
		if (userID) {
			try {
				const fetched = await client.users.fetch(userID);
				user = fetched.tag;
			} catch {
				user = 'Unknown';
			}
		} else {
			user = 'no one';
		}
		return user;
	}

	static cleanAnilistHTML(html, removeLineBreaks = true) {
		let clean = html;
		if (removeLineBreaks) clean = clean.replace(/\r|\n|\f/g, '');
		clean = decodeHTML(clean);
		clean = clean
			.replaceAll('<br>', '\n')
			.replace(/<\/?(i|em)>/g, '*')
			.replace(/<\/?b>/g, '**')
			.replace(/~!|!~/g, '||');
		if (clean.length > 2000) clean = `${clean.substr(0, 1995)}...`;
		const spoilers = (clean.match(/\|\|/g) || []).length;
		if (spoilers !== 0 && (spoilers && (spoilers % 2))) clean += '||';
		return clean;
	}

	static splitMessage(text, { maxLength = 2000, char = '\n', prepend = '', append = '' } = {}) {
		if (text.length <= maxLength) return [text];
		let splitText = [text];
		if (Array.isArray(char)) {
			while (char.length > 0 && splitText.some(elem => elem.length > maxLength)) {
				const currentChar = char.shift();
				if (currentChar instanceof RegExp) {
					splitText = splitText.flatMap(chunk => chunk.match(currentChar));
				} else {
					splitText = splitText.flatMap(chunk => chunk.split(currentChar));
				}
			}
		} else {
			splitText = text.split(char);
		}
		if (splitText.some(elem => elem.length > maxLength)) throw new RangeError('SPLIT_MAX_LEN');
		const messages = [];
		let msg = '';
		for (const chunk of splitText) {
			if (msg && (msg + char + chunk + append).length > maxLength) {
				messages.push(msg + append);
				msg = prepend;
			}
			msg += (msg && msg !== prepend ? char : '') + chunk;
		}
		return messages.concat(msg).filter(m => m);
	}
};
