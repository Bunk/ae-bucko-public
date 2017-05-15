const aupair = require( "aupair" );
const humanize = require( "humanize-duration" );

module.exports = ( { config, colors, log, pkg, slapp } ) => {
	slapp.message( /(status|uptime)(\?)?$/i, [ "direct_message", "mention" ], ( msg ) => {
		const hostname = config.identity;
		const uptime = humanize( process.uptime() * 1000 ); // eslint-disable-line no-magic-numbers

		aupair.check().then( status => {
			msg.say( {
				text: `*v${ pkg.version }* — ${ transformMessage( status ) }`,
				fallback: `v${ pkg.version } Status: ${ transformState( status ) }`,
				attachments: [ {
					mrkdwn_in: [ "text" ], // eslint-disable-line camelcase
					color: transformColor( status ),
					fields: [
						{ title: "Uptime", value: uptime, short: true },
						{ title: "Host", value: hostname, short: true },
						...transformDetails( status )
					]
				} ]
			} );
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
