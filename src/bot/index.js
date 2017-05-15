const logger = require( "./logger" );
const colors = require( "./colors" );
const commands = require( "./commands" );
const server = require( "./startup/server" );
const advice = require( "./services/advice" );
const git = require( "./services/git" );
const storage = require( "./services/storage" );

module.exports = ( config, pkg ) => {
	const app = {
		config, pkg, colors, advice,
		log: logger( config ),
		start() {
			server( app )
				.start( commands )
				.then( () => app.log.info( "Bot started" ) )
				.catch( err => app.kill( err ) );
		},
		stop() {
			app.bot.destroy();
		},
		kill: /* istanbul ignore next */ ( err, msg ) => {
			app.log.fatal( err, msg );
			process.exit( 1 ); // eslint-disable-line no-process-exit
		}
	};

	app.storage = storage( app );
	app.git = git( app );

	return app;
};
