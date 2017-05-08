const bunyan = require( "bunyan" );

function normalizeLevel( level ) {
	switch ( level ) {
		case "notice": return "info";
		default: return level;
	}
}

module.exports = ( config ) => {
	const log = bunyan.createLogger( {
		name: "mobile-mobot",
		level: config.log.level
	} );

	return Object.assign( log, {
		log( level, ...args ) {
			level = normalizeLevel( level );
			log[ level ]( ...args );
		}
	} );
};
