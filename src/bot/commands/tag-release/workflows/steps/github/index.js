/* eslint-disable global-require */
module.exports = ( app ) => ( msg ) => {
	const git = app.git( msg );
	return {
		async validateAccess( state ) {
			const repository = `${ state.repo.user }/${ state.repo.name }`;
			const repo = git.repos( state.repo.user, state.repo.name );
			try {
				const user = await git.user.fetch();
				state.repo.userObj = user;
			} catch ( err ) {
				throw new Error( "Unable to authorize with the current GitHub token" );
			}

			try {
				await repo.fetch();
			} catch ( err ) {
				throw new Error( `Unable to find repository '${ repository }'.  Make sure it's spelled correctly and that you have access.` );
			}

			try {
				await repo.collaborators( state.repo.userObj.login ).fetch();
			} catch ( err ) {
				throw new Error( `You don't have push access to '${ repository }'` );
			}
		},
		...require( "./content" )( app, git ),
		...require( "./branch" )( app, git ),
		...require( "./commit" )( app, git ),
		...require( "./merge" )( app, git ),
		...require( "./tag" )( app, git ),
		...require( "./release" )( app, git )
	};
};
