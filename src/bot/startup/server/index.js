const slappFactory = require( "slapp" );
const express = require( "express" );
const contextFactory = require( "slapp-context-beepboop" );
const convoFactory = require( "slapp-convo-beepboop" );

module.exports = ( app ) => {
	const api = {
		async start( commands ) {
			const { port } = app.config.web;

			app.slapp = slappFactory( {
				verify_token: app.config.slack.verificationToken,
				log: true,
				colors: true,
				context: contextFactory(),
				convo_store: convoFactory()
			} );

			app.server = app.slapp.attachToExpress( express() );
			return new Promise( ( resolve, reject ) => {
				app.server.listen( port, err => {
					if ( err ) {
						return reject( err );
					}
					return resolve();
				} );
			} ).then( () => commands.init( app ) );
		}
	};

	return api;
};
