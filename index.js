/**
 * Created by Zaccary on 29/09/2015.
 */


var hue = require("node-hue-api");
var HueApi = hue.HueApi;
var hueLightState = hue.lightState;
var chroma = require('chroma-js');
var moment = require('moment');

var config = require('./config/env');

var displayBridges = function(bridge) {
	console.log("Hue Bridges Found: " + JSON.stringify(bridge));
};

function getColourFromKelvin(temp) {
	return chroma.kelvin(temp)._rgb.map(function(c, i) {
		if(i < 3) {
			return Math.floor(c);
		}
	});
}

hue.nupnpSearch(function(err, result) {
	if (err) throw err;
	displayBridges(result);
});

var api = new HueApi(config.hub_address, config.user_id);

api.getFullState(function(err, config) {
	if(err) throw err;

	console.log(config.sensors[1].state);
});

function rise() {
	api.lights(function(err, lights) {
		if(err) throw err;

		var interval;
		var lightState;
		var i = 1;
		var lightIds = [1, 3];
		var temp = config.temp.min;
		var tempMax = config.temp.max;
		var brightness = 0;
		var intervalTemp = temp;
		var hue = getColourFromKelvin(temp);

		lightState = hueLightState.create().on();
		interval = setInterval(function () {
			intervalTemp = Math.floor(temp + ((tempMax - temp) / (config.rise_duration)) * i);
			hue = getColourFromKelvin(intervalTemp);
			brightness = brightness <= 255 ? Math.floor(i * 0.5) : 255;
			lightState.rgb(hue).bri(brightness);

			console.log("\n");
			console.log("\n");
			console.log("time: " + i + " seconds");
			console.log("temp: " + intervalTemp + "k");
			console.log("brightness: " + brightness);

			for (var l in lightIds) {
				api.setLightState(lightIds[l], lightState, function (err, lights) {
					if (err) throw err;
				});
			}

			if (intervalTemp >= tempMax) {
				clearInterval(interval);
			}

			i += 1;
		}, 1000);
	});
}

var checkShouldStart = setInterval(function() {
	var isInTimeFrame = moment().isBetween(moment({hour: 7, minute: 30}), moment({hour: 8, minute: 0}));
	console.log(isInTimeFrame);

	if(isInTimeFrame) {
		rise();
		clearInterval(checkShouldStart)
	}
}, config.check_interval);

rise();

