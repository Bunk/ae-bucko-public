module.exports = ( app ) => {
	const { git } = app;
	return {
		async tagVersion( state ) {
			// (1) Create the annotated tag object
			// TODO: The tags resource isn't implemented in the library—create a PR to add it
			const { object: { sha } } = await git.fromUrl( `/repos/${ state.repo.user }/${ state.repo.name }/git/tags` ).create( {
				tag: state.currentVersionTag,
				message: "...",
				object: state.currentHead,
				type: "commit"
			} );

			// (2) Create the tag reference
			await git.repos( state.repo.user, state.repo.name ).git.refs.create( {
				sha,
				ref: `refs/tags/${ state.currentVersionTag }`
			} );
		}
	};
};
