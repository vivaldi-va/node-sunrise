/**
 * Created by Zaccary on 29/09/2015.
 */

"use strict";

const hue = require("node-hue-api");
const HueApi = hue.HueApi;
var hueLightState = hue.lightState;

const chroma = require('chroma-js');
const schedule = require('node-schedule');
const log = require('log4js').getLogger('rise');
const config = require('./config/env');

var api;

function getColourFromKelvin(temp) {
	return chroma.kelvin(temp)._rgb.map(function(c, i) {
		if(i < 3) {
			return Math.floor(c);
		}
	});
}

function getReachableLightIds(lights) {
	var lightIdArr = [];
	for(var l in lights) {
		if(lights[l].state.reachable) {
			lightIdArr.push(l);
		}
	}

	return lightIdArr;
}

function getBrightnessAtTime() {
	var a = config.brightness.max / (Math.log2(config.rise_duration));

	return function(t) {
		return Math.floor(a * Math.log2(t));
	}
}

function getTempAtTime() {
	var a = (config.temp.max - config.temp.min) / Math.pow(config.rise_duration, 2);

	return function(t) {
		return Math.floor(a * Math.pow(t, 2) + config.temp.min);
	}
}

/**
 * initialize the simulation by finding the bridge and connecting to it,
 * then running `rise()`
 */
function init() {
	log.info("searching for Hue bridges");
	hue.nupnpSearch(function(err, result) {
		if (err) throw err;

		log.info("found bridges", result);

		api = new HueApi(result[0].ipaddress, config.user_id);
		rise();
	});
}

function rise() {
	api.getFullState(function(err, state) {
		if(err) throw err;

		var interval;
		var lightState;
		var i = 1;
		var lightIds = getReachableLightIds(state.lights);
		var temp = config.temp.min;
		var brightness = 1;
		var tempCalc = getTempAtTime();
		var brightnessCalc = getBrightnessAtTime();
		var intervalTemp = temp;
		var hue = getColourFromKelvin(temp);

		lightState = hueLightState.create().on();

		interval = setInterval(function () {
			intervalTemp = tempCalc(i);
			brightness = brightnessCalc(i);

			hue = getColourFromKelvin(intervalTemp);
			lightState.rgb(hue).bri(brightness);

			log.info("\n");
			log.info("\n");
			log.info("time: " + i + " seconds");
			log.info("temp: " + intervalTemp + "k");
			log.info("brightness: " + brightness);
			log.info("light: ", lightState);

			for (let l in lightIds) {
				if(lightIds.hasOwnProperty(l)) {
					api.setLightState(lightIds[l], lightState, function (err, lights) {
						if (err) throw err;
					});
				}
			}

			if (i >= config.rise_duration) {
				clearInterval(interval);
				log.info("Finished rise.");
			}

			i += 1;
		}, 1000);
	});
}

(function() {
	log.info("starting schedule");

	// Rule for handling weekdays
	const weekdayRule = new schedule.RecurrenceRule();
	weekdayRule.dayOfWeek = [
		new schedule.Range(
			config.schedule.weekday.dayOfWeek.start,
			config.schedule.weekday.dayOfWeek.end
		)];
	weekdayRule.hour = config.schedule.weekday.hour;
	weekdayRule.minute = config.schedule.weekday.minute;


	// rule for handling weekends
	// uses array of days instead of range
	// as JS starts week on sunday
	const weekendRule = new schedule.RecurrenceRule();
	weekendRule.dayOfWeek = [
		config.schedule.weekend.dayOfWeek.start,
		config.schedule.weekend.dayOfWeek.end
	];
	weekendRule.hour = config.schedule.weekend.hour;
	weekendRule.minute = config.schedule.weekend.minute;

	log.debug("weekday rule set", weekdayRule);
	log.debug("weekend rule set", weekendRule);

	const weekday = schedule.scheduleJob(weekdayRule, init);
	const weekend = schedule.scheduleJob(weekendRule, init);

})();

