/* eslint-disable global-require */
module.exports = ( app ) => {
	const { git } = app;

	return {
		async validateAccess( state ) {
			try {
				await git.repos( state.repo.user, state.repo.name ).fetch();
			} catch ( err ) {
				throw new Error( `Unable to find repository: ${ state.repository }` );
			}
		},
		async getShortLog( state ) {
			const { commits } = await git.repos( state.repo.user, state.repo.name )
				.compare( state.lastVersionTag, "develop" ).fetch();

			const log = commits
				.filter( obj => obj.parents.length === 1 ) // non-merge commits
				.map( obj => `* ${ obj.commit.message }` );

			state.defaultLog = log;
		},
		...require( "./branch" )( app ),
		...require( "./commit" )( app ),
		...require( "./merge" )( app ),
		...require( "./tag" )( app ),
		...require( "./release" )( app )
	};
};
