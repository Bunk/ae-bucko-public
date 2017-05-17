module.exports = ( app ) => {
	const { git, log } = app;
	return {
		fetchContents: ( pathFn, refFn ) => async function fetchContents( state ) {
			const path = pathFn( state );
			const ref = refFn( state );

			try {
				const repo = git.repos( state.repo.user, state.repo.name );
				const contents = await repo.contents( path ).read( { ref } );
				state.files[ path ] = contents;
			} catch ( err ) {
				log.warn( err, `Unable to find a '${ path }' at revision ${ ref }` );
			}
		}
	};
};
