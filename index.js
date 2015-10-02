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

hue.nupnpSearch(function(err, result) {
	if (err) throw err;
	//displayBridges(result);
});

var api = new HueApi(config.hub_address, config.user_id);

api.getFullState(function(err, config) {
	if(err) throw err;

	//console.log(config);
	for(var l in config.lights) {
		//console.log(config.lights[l].state);
	}
});

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

			console.log("\n");
			console.log("\n");
			console.log("time: " + i + " seconds");
			console.log("temp: " + intervalTemp + "k");
			console.log("brightness: " + brightness);
			console.log("light: ", lightState);

			for (var l in lightIds) {
				api.setLightState(lightIds[l], lightState, function (err, lights) {
					if (err) throw err;
				});
			}

			if (i >= config.rise_duration) {
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

