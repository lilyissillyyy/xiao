const request = require('node-superfetch');
const { decode: decodeHTML } = require('html-entities');
const regions = ['en', 'ar', 'cn', 'de', 'es', 'fr', 'il', 'it', 'jp', 'kr', 'nl', 'pt', 'ru', 'tr', 'id'];
const answers = ['Yes', 'No', 'Don\'t know', 'Probably', 'Probably not'];

class Akinator {
	constructor(region, childMode = false) {
		if (!regions.includes(region.toLowerCase())) throw new TypeError('Invalid region.');
		this.region = region.toLowerCase();
		this.childMode = Boolean(childMode);

		this.currentStep = 0;
		this.stepLastProposition = '';
		this.progress = '0.00000';
		this.answers = answers;
		this.question = null;
		this.session = null;
		this.signature = null;
		this.guessed = null;
		this.akiWin = null;
	}

	async start() {
		const { text } = await request
			.post(`https://${this.region}.akinator.com/game`)
			.send({
				sid: '1',
				cm: this.childMode
			});
		this.question = text.match(/<p class="question-text" id="question-label">(.+)<\/p>/)[1];
		this.session = text.match(/session: '(.+)'/)[1];
		this.signature = text.match(/signature: '(.+)'/)[1];
		this.answers = [
			decodeHTML(text.match(/<a class="li-game" href="#" id="a_yes" data-index="0">(.+)<\/a>/)[1]),
			decodeHTML(text.match(/<a class="li-game" href="#" id="a_no" data-index="1">(.+)<\/a>/)[1]),
			decodeHTML(text.match(/<a class="li-game" href="#" id="a_dont_know" data-index="2">(.+)<\/a>/)[1]),
			decodeHTML(text.match(/<a class="li-game" href="#" id="a_probably" data-index="3">(.+)<\/a>/)[1]),
			decodeHTML(text.match(/<a class="li-game" href="#" id="a_probaly_not" data-index="4">(.+)<\/a>/)[1])
		];
		return this;
	}

	async step(answer) {
		const { body } = await request
			.post(`https://${this.region}.akinator.com/answer`)
			.send({
				step: this.currentStep.toString(),
				progression: this.progress,
				sid: '1',
				cm: this.childMode,
				answer,
				step_last_proposition: this.stepLastProposition,
				session: this.session,
				signature: this.signature
			});
		if (body.id_proposition) {
			this.guessed = {
				id: body.id_proposition,
				name: body.name_proposition,
				description: body.description_proposition,
				photo: body.photo
			};
			return this;
		}
		this.currentStep++;
		this.progress = body.progression;
		this.question = body.question;
		if (!this.question) this.akiWin = false;
		return this;
	}

	async back() {
		const { body } = await request
			.post(`https://${this.region}.akinator.com/cancel_answer`)
			.send({
				step: this.currentStep.toString(),
				progression: this.progress,
				sid: '1',
				cm: this.childMode,
				session: this.session,
				signature: this.signature
			});
		this.currentStep--;
		this.progress = body.progression;
		this.question = body.question;
		return this;
	}

	async guess(correct, keepGoing) {
		if (correct) {
			this.akiWin = true;
			return this;
		}
		if (!correct && keepGoing) {
			const { body } = await request
				.post(`https://${this.region}.akinator.com/exclude`)
				.send({
					step: this.currentStep.toString(),
					sid: '1',
					cm: this.childMode,
					progression: this.progress,
					session: this.session,
					signature: this.signature
				});
			this.guessed = null;
			this.stepLastProposition = body.step;
			this.progress = body.progression;
			this.question = body.question;
			return this;
		}
		this.akiWin = false;
		return this;
	}
}

module.exports = { Akinator, regions };
