module.exports = ( { slapp } ) => ( msg ) => {
	return {
		ask: ( question ) => ( state ) => {
			msg.respond( question( state ) );
		},
		say: ( fn, { deleteOriginal = false } = {} ) => ( state ) => {
			msg.say( fn( state ) );
			if ( deleteOriginal ) {
				msg.respond( { delete_original: true } );
			}
		},
		lookupUser( state ) {
			const { bot_token, user_id } = msg.meta;
			return new Promise( ( resolve, reject ) => {
				slapp.client.users.info( { token: bot_token, user: user_id }, ( err, data ) => {
					if ( err ) {
						return reject( err );
					}
					return resolve( data );
				} );
			} ).then( data => {
				state.author = {
					name: data.user.name,
					realName: data.user.profile.real_name,
					id: data.user.id,
					icon: data.user.profile.image_24
				};
			} );
		}
	};
};
