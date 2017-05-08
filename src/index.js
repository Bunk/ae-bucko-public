const config = require( "./config" );
const botFactory = require( "./bot" );
const pkg = require( "../package.json" );

module.exports = botFactory( config, pkg ).start();
