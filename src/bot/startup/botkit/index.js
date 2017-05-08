/* eslint-disable camelcase, no-shadow, no-magic-numbers */
const botkit = require( "botkit" );
const middleware = require( "./middleware" );

module.exports = ( app ) => {
	function initializeStorage( config ) {
		if ( config.storage.dir ) {
			return { json_file_store: config.storage.dir };
		}
		return { storage: config.storage };
	}

	const api = {
		async start( commands ) {
			const token = app.config.slack.token;
			if ( !token ) {
				throw new Error( "Slack token is required" );
			}

			// This is the main bot controller used to communicate with Slack
			app.controller = botkit
				.slackbot( {
					debug: true,
					logger: app.log,
					retry: Infinity,
					interactive_replies: true,
					...initializeStorage( app.config )
				} )
				.configureSlackApp( {
					clientId: app.config.slack.clientId,
					clientSecret: app.config.slack.clientSecret,
					scopes: []
				} )
				.setupWebserver( app.config.web.port, ( err, webserver ) => {
					app.controller
						.createWebhookEndpoints( webserver )
						.createOauthEndpoints( webserver, ( err, req, res ) => {
							if ( err ) {
								res.status( 500 ).send( `Error: ${ err }` );
							} else {
								res.send( "Success!" );
							}
						} )
						.startTicking();
				} );

			middleware( app ).apply( app.controller );

			await commands.init( app );

			// Spawn an instance of the bot
			// const bot = app.controller.spawn( { token } );
			// bot.startRTM( err => {
			// 	if ( err ) {
			// 		app.log.error( { err }, "Error establishing RTM connection" );
			// 	}
			// } );
		}
	};

	return api;
};
