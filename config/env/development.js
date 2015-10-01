/**
 * Created by Zaccary on 29/09/2015.
 */

module.exports = {
	"user_id": "3b1029621d5301d7d65fc7e14fea7e3",
	"hub_address": "10.10.10.106",
	"rise_duration": 60*1, // duration of rise in seconds
	"check_interval": 1000*60, // interval to check if rise should run
	temp: {
		"min": 1600,
		"max": 20000
	},
	brightness: {
		"max": 160
	},
	"schedule": {
		"monday": {hour: 7, minute: 30},
		"tuesday": {hour: 7, minute: 30},
		"wednesday": {hour: 7, minute: 30},
		"thursday": {hour: 7, minute: 30},
		"friday": {hour: 7, minute: 30},
		"saturday": {hour: 7, minute: 30},
		"sunday": {hour: 7, minute: 30}
	}
};