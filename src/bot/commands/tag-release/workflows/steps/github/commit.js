module.exports = ( app ) => {
	const { git, log } = app;
	return {
		fetchContents: ( pathFn ) => async ( state ) => {
			const path = pathFn( state );
			try {
				const contents = await git.repos( state.repo.user, state.repo.name )
					.contents( path )
					.read( { ref: state.lastVersionTag } );
				( state.files = state.files || {} )[ path ] = contents;
			} catch ( err ) {
				log.warn( err, `Unable to find a '${ path }' at revision ${ state.lastVersionTag }` );
			}
		},
		stageFile: ( pathFn ) => async ( state ) => {
			const path = pathFn( state );
			const content = ( state.files || {} )[ path ];
			if ( content ) {
				( state.stagedChanges = state.stagedChanges || [] ).push( { path, content, mode: "100644" } );
			}
		},
		async commitStaged( state ) {
			const repo = git.repos( state.repo.user, state.repo.name );

			// (1) Get the ref for the base commit we're branching off of
			const workingRef = `heads/${ state.currentBranch }`;
			const workingSha = state.currentHead;
			// (2) Get the ref for the tree we're going to update
			const { tree: { sha: treeSha } } = await repo.git.commits( workingSha ).fetch();
			// (3) Create a new tree with the updated files based on the base tree
			const { sha: newTreeSha } = await repo.git.trees.create( {
				tree: state.stagedChanges,
				base_tree: treeSha
			} );
			// (4) Create a new commit referencing the updated tree
			const { sha: newCommitSha } = await repo.git.commits.create( {
				parents: [ workingSha ],
				tree: newTreeSha,
				message: state.currentVersion
			} );
			// (5) Move the head ref to the new commit
			await repo.git.refs( workingRef ).update( { sha: newCommitSha } );

			state.currentHead = newCommitSha;
		}
	};
};
