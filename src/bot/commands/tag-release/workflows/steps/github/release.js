const semver = require( "semver" );

module.exports = ( app ) => {
	const { git } = app;
	return {
		async getLatestVersion( state ) {
			try {
				const { tagName } = await git.repos( state.repo.user, state.repo.name ).releases.latest.fetch();
				state.refs.current = `tags/${ tagName }`;
				state.versions.latest = semver.clean( tagName );
			} catch ( err ) {
				// We couldn't find a release, so let's use what's in the package.json on the base branch
				const config = JSON.parse( state.files[ state.filePaths.package ] );
				state.refs.current = `heads/${ state.branches.head }`;
				state.versions.latest = semver.clean( config.version );
			}
		},
		async getDefaultReleaseName( state ) {
			state.defaults.releaseName = state.answers.releaseLog.slice().pop().replace( "* ", "" );
		},
		async getDefaultReleaseLog( state ) {
			const base = state.refs.current.split( "/" )[ 1 ]; // current-release-tag || master
			const head = state.branches.head; // develop || head
			const repo = git.repos( state.repo.user, state.repo.name );
			try {
				const { commits } = await repo.compare( base, head ).fetch();

				const log = commits
					.filter( obj => obj.parents.length === 1 ) // non-merge commits
					.map( obj => obj.commit.message.replace( /(?:\r\n|\r|\n)/g, " " ) )
					.map( message => `* ${ message }` );

				state.defaults.releaseLog = log;
			} catch ( err ) {
				if ( err.status === 404 ) {
					throw new Error( `Couldn't compare between branch '${ base }' and '${ head }'` );
				}
				throw err;
			}
		},
		async validateDefaultReleaseLog( state ) {
			if ( !state.defaults.releaseLog.length ) {
				const base = state.refs.current.split( "/" )[ 1 ];
				const head = state.branches.head;
				throw new Error( `There are no commits between '${ base }' and '${ head }' to tag.` );
			}
		},
		async createRelease( state ) {
			const repo = git.repos( state.repo.user, state.repo.name );

			state.release = {
				tag_name: `v${ state.versions.current }`,
				target_commitish: state.refs.current,
				name: state.answers.releaseName,
				body: state.answers.releaseLog.join( "\n" )
			};

			const { htmlUrl } = await repo.releases.create( state.release );

			state.release.url = htmlUrl;
		}
	};
};
