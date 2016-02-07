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
		"weekday": {
			dayOfWeek: {
				start: 1,
				end: 5
			},
			hour: 6,
			minute: 45
		},
		"weekend": {
			dayOfWeek: {
				start: 0,
				end: 6
			},
			hour: 10,
			minute: 0
		}
	}
};