/* eslint-disable global-require */
const _ = require( "lodash" );
const path = require( "path" );
const fs = require( "fs" );
const os = require( "os" );

function loadConfig() {
	const customConfigPath = path.resolve( "./config.js" );
	const custom = fs.existsSync( customConfigPath ) ? require( customConfigPath ) : {};
	const defaults = require( "./defaults.js" );

	const config = _.defaultsDeep( custom, defaults );
	config.machine = os.hostname();
	config.pid = process.pid;
	config.identity = `${ config.machine }.${ config.pid }`;

	console.log( config );

	return config;
}

module.exports = loadConfig();
