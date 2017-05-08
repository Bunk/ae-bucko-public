const execa = require( "execa" );
const byline = require( "byline" );

module.exports = ( { log } ) => {
	const api = {
		run( fn ) {
			function logStreams( ...streams ) {
				streams.forEach( stream => {
					stream.setEncoding( "utf-8" );
					byline( stream ).on( "data", line => log.info( line ) );
				} );
			}

			const exec = fn();
			logStreams( exec.stdout, exec.stderr );

			return exec.then( result => result.stdout );
		},
		exec( cmd, args, opt ) {
			log.info( { args: args.join( " " ), opt }, cmd );
			return api.run( () => execa( cmd, args, opt ) );
		},
		sh( cmd, opt ) {
			log.info( { opt }, cmd );
			return api.run( () => execa.shell( cmd, opt ) );
		}
	};

	return api;
};
