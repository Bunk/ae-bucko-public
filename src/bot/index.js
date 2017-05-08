const logger = require( "./logger" );
const commands = require( "./commands" );
const botkit = require( "./startup/botkit" );
const colors = require( "./colors" );
const fs = require( "./services/fs" );
const shell = require( "./services/shell" );
const git = require( "./services/git" );

module.exports = ( config, pkg ) => {
	const app = {
		config, pkg, fs, colors,
		log: logger( config ),
		start() {
			botkit( app )
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

	app.shell = shell( app );
	app.git = git( app );

	return app;
};
