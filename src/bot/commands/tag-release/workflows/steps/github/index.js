/* eslint-disable global-require */
module.exports = ( app ) => ( msg ) => {
	const git = app.git( msg );
	return {
		async validateAccess( state ) {
			try {
				await git.repos( state.repo.user, state.repo.name ).fetch();
			} catch ( err ) {
				const repository = `${ state.repo.user }/${ state.repo.name }`;
				throw new Error( `Unable to find repository '${ repository }'.  Make sure it's spelled correctly and that you have access.` );
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
