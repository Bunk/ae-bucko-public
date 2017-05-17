module.exports = ( app, git ) => {
	return {
		tagVersion: ( refFn ) => async function tagVersion( state ) {
			const ref = refFn( state );
			const tag = `v${ state.versions.current }`;
			const repo = git.repos( state.repo.user, state.repo.name );

			// (1) Create the annotated tag object
			// TODO: The tags resource isn't implemented in the library—create a PR to add it
			const { object: { sha } } = await git.fromUrl( `/repos/${ state.repo.user }/${ state.repo.name }/git/tags` ).create( {
				tag,
				object: ref,
				message: "...",
				type: "commit"
			} );

			// (2) Create the tag reference
			await repo.git.refs.create( { sha, ref: `refs/tags/${ tag }` } );
		}
	};
};
