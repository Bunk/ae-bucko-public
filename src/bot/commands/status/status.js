const aupair = require( "aupair" );
const humanize = require( "humanize-duration" );

module.exports = ( { config, colors, log, pkg, controller } ) => {
	controller.hears(
		[ /(status|uptime)(\?)?$/i ],
		"direct_message,direct_mention,mention",
		async ( bot, message ) => {
			const hostname = config.identity;
			const uptime = humanize( process.uptime() * 1000 ); // eslint-disable-line no-magic-numbers
			const status = await aupair.check();
			bot.reply( message, {
				fallback: `${ bot.identity.name } v${ pkg.version } ${ transformState( status ) }`,
				attachments: [ {
					mrkdwn_in: [ "text" ], // eslint-disable-line camelcase
					color: transformColor( status ),
					title: `${ bot.identity.name } v${ pkg.version }`,
					fallback: `${ bot.identity.name } v${ pkg.version } Status: ${ transformState( status ) }`,
					text: transformMessage( status ),
					fields: [
						{ title: "Uptime", value: uptime, short: true },
						{ title: "Host", value: hostname, short: true },
						...transformDetails( status )
					]
				} ]
			} );
		} );

	function transformColor( status ) {
		if ( status.degraded ) {
			return colors.degraded;
		}
		return status.healthy ? colors.healthy : colors.unhealthy;
	}

	function transformState( status ) {
		if ( status.degraded ) {
			return "degraded";
		}
		return status.healthy ? "ok" : "down";
	}

	function transformStateIcon( status ) {
		if ( status.degraded ) {
			return ":poopfire:";
		}
		return status.healthy ? ":thumbsup:" : ":thumbsdown:";
	}

	function transformDetails( status ) {
		return status.details.map( detail => {
			return {
				title: detail.name,
				value: `${ transformStateIcon( detail ) } ${ detail.message }`,
				short: true
			};
		} );
	}

	function transformMessage( status ) {
		if ( status.degraded ) {
			return "Looks like someone's a lunger.";
		}
		return status.healthy ? "Up and 'atem! :cow:" : "I'm goin' through the mill, boys...";
	}
};
