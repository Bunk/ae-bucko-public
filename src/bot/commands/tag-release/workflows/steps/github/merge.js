module.exports = ( app ) => {
	const { git } = app;
	return {
		async openPullRequest( state ) {
			const { number } = await git.repos( state.repo.user, state.repo.name ).pulls.create( {
				title: `tag-release: ${ state.currentBranch }`,
				head: state.currentBranch,
				base: "develop"
			} );
			state.currentPullRequest = number;
		},
		async closePullRequest( state ) {
			if ( state.currentPullRequest ) {
				await git.repos( state.repo.user, state.repo.name ).pulls( state.currentPullRequest ).update( {
					state: "closed"
				} );
			}
		},
		mergePullRequest: ( method = "merge" ) => async ( state ) => {
			const repo = git.repos( state.repo.user, state.repo.name );
			const { sha } = await repo.pulls( state.currentPullRequest ).merge.add( { merge_method: method } );
			state.currentHead = sha;
		},
		mergeFastForward: ( ref ) => async ( state ) => {
			const repo = git.repos( state.repo.user, state.repo.name );
			await repo.git.refs( ref ).update( { sha: state.currentHead } );
		}
	};
};
