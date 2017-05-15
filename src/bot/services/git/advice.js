const _ = require( "lodash" );
const meld = require( "meld" );

const reqMethods = [
	"get", "getNoFollow", "getOptions", "put",
	"del", "patch", "post", "limit"
];
const apiMethods = [
	"me", "user", "repo", "org", "gist", "team",
	"pr", "release", "search", "issue", "project",
	"milestone", "label", "notification"
];

const api = ( advice ) => {
	const adviseApiCall = advice.promisify( results => {
		if ( results.length === 3 ) {
			// Handle raw requests
			const [ status, body, headers ] = results;
			return { status, body, headers };
		} else if ( results.length === 2 ) {
			// Handle api requests
			const [ body, headers ] = results;
			return { body, headers };
		}
		return results;
	} );

	const adviseApiMethod = {
		around( joinpoint ) {
			const api = joinpoint.proceed();
			meld( api, /.*/, adviseApiCall );
			return api;
		}
	};

	const repositoryAdvice = ( client ) => ( {
		around( joinpoint ) {
			const repo = joinpoint.proceed();
			repo.createBranch = async ( { base, name } ) => {
				const ref = `refs/heads/${ name }`;
				// Get the sha ref for the point we want to branch from
				const { body: { object: { sha } } } = await repo.ref( base );
				// Create a new ref pointing to the same sha
				return repo.createReference( ref, sha );
			};
			repo.commit = async ( { changes, base = "heads/master", message } ) => {
				//       GET /repos/:owner/:repo/git/refs/heads/master (store commit_sha)
				const { body: { object: { sha: commitSha } } } = await repo.ref( base );
				//       GET /repos/:owner/:repo/git/commits/{commit_sha} (store base_tree)
				const { body: { tree: { sha: baseTree } } } = await repo.commit( commitSha );
				//       POST /repos/:owner/:repo/git/trees (store tree_sha)
				//         { base_tree, tree: [ {
				//           path: {configPath}, content: {config}, mode: "100644",
				//           path: {changeLogPath}, content: {changeLogPath}, mode: "100644",
				//         ] }
				// const tree = [
				// 	{ path: "package.json", content: "", mode: "100644" },
				// 	{ path: "", content: "", mode: "100644" }
				// ];
				// const { body: { sha: treeSha } } = await repo.createTree( tree, baseTree );
				// //       POST /repos/:owner/:repo/git/commits (store new_commit_sha)
				// //         { parents: [ {commit_sha} ], tree: {tree_sha}, message: "{version}" }
				// const { body: { sha: newCommitSha } } = await repo.createCommit( message, treeSha, [ commitSha ] );
				// //       PATCH /repos/:owner/:repo/refs/heads/master
				// //         { sha: {new_commit_sha}, force: false }
				// await repo.createReference( "heads/master", newCommitSha );
				console.log( baseTree );
			};
			return repo;
		}
	} );

	return {
		adviseClient( client ) {
			meld( client, reqMethods, adviseApiCall );
			meld( client, apiMethods, adviseApiMethod );
			meld( client, [ "repo" ], repositoryAdvice( client ) );
			return client;
		}
	};
};

module.exports = api;
