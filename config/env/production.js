/**
 * Created by Zaccary on 02/10/2015.
 */

module.exports = {
	"user_id": "3b1029621d5301d7d65fc7e14fea7e3",
	"rise_duration": 60*30, // duration of rise in seconds
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
		"saturday": {hour: 10, minute: 0},
		"sunday": {hour: 10, minute: 0}
	},
	"cron": "30 7 * * 1-5" // mon-fri @ 7:30am
};