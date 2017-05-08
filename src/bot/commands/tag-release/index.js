module.exports = ( { config, colors, log, pkg, controller } ) => {
	controller.on( "slash_command", async ( bot, message ) => {
		bot.replyPrivateDelayed( message, "Only you can see this, dude" );
	} );
};
