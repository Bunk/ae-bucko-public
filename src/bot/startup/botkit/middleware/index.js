const advice = require( "./advice" );
const repository = require( "./repository" );

module.exports = ( app ) => {
	const advisor = advice( app );
	return {
		apply( controller ) {
			// AOP advice for the controller and bots
			advisor.adviseController( controller );
			controller.middleware.spawn.use( ( bot, next ) => {
				advisor.adviseBot( bot );
				next();
			} );

			// Git repository access attached to the bot
			controller.middleware.spawn.use( repository( app ) );
			// Show a typing message when the bot is responding
			controller.middleware.heard.use( ( bot, message, next ) => {
				bot.startTyping( message );
				next();
			} );
		}
	};
};
