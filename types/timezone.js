const Argument = require('../framework/ArgumentType');
const cityTimezones = require('city-timezones');
const { ZipToTz } = require('zip-to-timezone');
const moment = require('moment-timezone');

module.exports = class TimezoneType extends Argument {
	constructor(client) {
		super(client, 'timezone');
	}

	validate(value) {
		const directZone = moment.tz.zone(value.replaceAll(' ', '_').toLowerCase());
		if (directZone) return true;
		try {
			new ZipToTz().full(value);
			return true;
		} catch {
			const cityZone = cityTimezones.lookupViaCity(value).filter(res => res.timezone);
			if (cityZone.length) return true;
			const provZone = cityTimezones.findFromCityStateProvince(value).filter(res => res.timezone);
			if (provZone.length) return true;
		}
		return false;
	}

	parse(value) {
		const directZone = moment.tz.zone(value.replaceAll(' ', '_').toLowerCase());
		if (directZone) return directZone.name;
		try {
			const zipZone = new ZipToTz().full(value);
			return zipZone;
		} catch {
			const cityZone = cityTimezones.lookupViaCity(value).filter(res => res.timezone);
			if (cityZone.length) return cityZone[0].timezone;
			const provZone = cityTimezones.findFromCityStateProvince(value).filter(res => res.timezone);
			if (provZone.length) return provZone[0].timezone;
		}
		return null;
	}

	example() {
		const zones = moment.tz.names();
		return zones[Math.floor(Math.random() * zones.length)];
	}
};
