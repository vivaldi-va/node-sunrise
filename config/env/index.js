/**
 * Created by Zaccary on 29/09/2015.
 */

var _ = require('lodash');

var all = {
	port: process.env.PORT || 3030,
	env: process.env.NODE_ENV || 'development'
};

module.exports = _.merge(
	all,
	require('./' + all.env + '.js')
);