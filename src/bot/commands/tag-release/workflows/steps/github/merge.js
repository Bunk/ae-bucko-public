module.exports = ( app, git ) => {
	return {
		openPullRequest: ( refFn ) => async function openPullRequest( state ) {
			const ref = refFn( state );
			const repo = git.repos( state.repo.user, state.repo.name );
			const { number } = await repo.pulls.create( {
				title: `tag-release: ${ state.branches.current }`,
				head: ref, // "pr-branch"
				base: state.branches.head // "develop"
			} );
			state.pr = number;
		},
		closePullRequest: async function closePullRequest( state ) {
			const repo = git.repos( state.repo.user, state.repo.name );
			if ( state.pr ) {
				await repo.pulls( state.pr ).update( { state: "closed" } );
			}
		},
		mergePullRequest: ( method = "merge" ) => async function mergePullRequest( state ) {
			const repo = git.repos( state.repo.user, state.repo.name );
			const { sha } = await repo.pulls( state.pr ).merge.add( { merge_method: method } );
			state.refs.current = sha;
		},
		mergeFastForward: ( branchFn ) => async function mergeFastForward( state ) {
			const branch = branchFn( state );
			const repo = git.repos( state.repo.user, state.repo.name );
			await repo.git.refs( `heads/${ branch }` ).update( { sha: state.refs.current } );
		}
	};
};
