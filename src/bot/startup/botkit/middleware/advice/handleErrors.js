function blockTemplate( val ) {
	return val ? `\`\`\`\n${ val }\n\`\`\`` : "";
}

module.exports = ( { log } ) => {
	const handle = ( fn ) => ( bot, message ) => {
		function handleCatch( err ) {
			log.error( err, "Unable to process the message" );

			/* eslint-disable camelcase */
			const att = {
				pretext: "I'm having some trouble with that request:",
				fallback: "I'm having some trouble with that request",
				color: "danger",
				text: blockTemplate( err.message ),
				mrkdwn_in: [ "text" ],
				ts: Math.round( Date.now() / 1000 ) // eslint-disable-line no-magic-numbers
			};
			if ( err.cmd ) {
				// Command error
				Object.assign( att, {
					text: blockTemplate( err.stderr ),
					footer: "sh",
					footer_icon: "http://d2.alternativeto.net/dist/icons/bash_99843.png?width=200&height=200&mode=crop&upscale=false",
					fields: [
						{ title: "command", value: err.cmd, short: false },
						{ title: "code", value: err.code, short: true }
					]
				} );
			}
			/* esling-enable camelcase */
			bot.replyInThread( message, { attachments: [ att ] } );
		}

		try {
			const result = fn( bot, message );
			if ( result && result.catch ) {
				return result.catch( handleCatch );
			}
			return result;
		} catch ( err ) {
			return handleCatch( err );
		}
	};

	return {
		around( joinpoint ) {
			// hears( patterns, types, mw (optional), callback )
			const originalCallback = joinpoint.args.pop();
			return joinpoint.proceed( ...joinpoint.args, handle( originalCallback ) );
		}
	};
};
