module.exports = ( app ) => {
	const { git } = app;
	return {
		validateBranch: ( branch ) => ( state ) => {
			return git.repos( state.repo.user, state.repo.name ).branches.contains( branch );
		},
		branchFrom: ( baseRef ) => async ( state ) => {
			const branch = `auto-tag-${ state.currentVersion }`;
			const repo = git.repos( state.repo.user, state.repo.name );

			// (1) Get the base commit sha
			const { object: { sha: commitSha } } = await repo.git.refs( `heads/${ baseRef }` ).fetch();

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

			state.currentBranch = branch;
			state.currentHead = commitSha;
		},
		async deleteBranch( state ) {
			if ( state.currentBranch ) {
				const ref = `heads/${ state.currentBranch }`;
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