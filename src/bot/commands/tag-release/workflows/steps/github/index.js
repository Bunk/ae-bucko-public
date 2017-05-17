/* eslint-disable global-require */
module.exports = ( app ) => {
	const { git } = app;

	return {
		async validateAccess( state ) {
			try {
				await git.repos( state.repo.user, state.repo.name ).fetch();
			} catch ( err ) {
				const repository = `${ state.repo.user }/${ state.repo.name }`;
				throw new Error( `Unable to find repository '${ repository }'.  Make sure it's spell correctly and that you have access.` );
			}
		},
		...require( "./content" )( app ),
		...require( "./branch" )( app ),
		...require( "./commit" )( app ),
		...require( "./merge" )( app ),
		...require( "./tag" )( app ),
		...require( "./release" )( app )
	};
};
