module.exports = ( app ) => {
	const { git } = app;
	return {
		validateBranch: ( fn ) => async function validateBranch( state ) {
			const branch = fn( state );
			const repo = git.repos( state.repo.user, state.repo.name );
			const val = await repo.branches.contains( branch );
			if ( !val ) {
				throw new Error( `The repository does not contain a '${ branch }' branch.` );
			}
		},
		branchFrom: ( refFn ) => async function branchFrom( state ) {
			const ref = refFn( state );
			const branch = `auto-tag-${ state.versions.current }`;
			const repo = git.repos( state.repo.user, state.repo.name );

			// (1) Get the base commit sha
			const { object: { sha: commitSha } } = await repo.git.refs( `${ ref }` ).fetch();

			// (2) See if the branch already exists
			const exists = await repo.git.refs.contains( `heads/${ branch }` );
			if ( !exists ) {
				// (3.a) Create it
				await repo.git.refs.create( { ref: `refs/heads/${ branch }`, sha: commitSha } );
			} else {
				// (3.b) Update it with a ff merge, otherwise we fail the process since someone else
				//       has already created this tagging branch.
				await repo.git.refs( `heads/${ branch }` ).update( { sha: commitSha } );
			}

			state.branches.current = branch;
			state.refs.current = commitSha;
		},
		deleteBranch: ( fn ) => async function deleteBranch( state ) {
			const branch = fn( state );
			if ( branch ) {
				const ref = `heads/${ branch }`;
				const repo = git.repos( state.repo.user, state.repo.name );
				// (1) See if the branch still exists
				const found = await repo.git.refs.contains( ref );
				if ( found ) {
					// (2) Delete the branch
					await repo.git.refs( ref ).remove();
				}
			}
		}
	};
};
