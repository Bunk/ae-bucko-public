const semver = require( "semver" );

module.exports = ( app ) => {
	const { git } = app;
	return {
		async getLatestVersion( state ) {
			const { tagName } = await git.repos( state.repo.user, state.repo.name ).releases.latest.fetch();
			state.lastVersion = semver.clean( tagName );
			state.lastVersionTag = tagName;
		},
		async getDefaultReleaseName( state ) {
			state.defaultReleaseName = state.confirmedLog.slice().pop().replace( "* ", "" );
		},
		async createRelease( state ) {
			const { htmlUrl } = await git.repos( state.repo.user, state.repo.name ).releases.create( {
				tag_name: state.currentVersionTag,
				target_commitish: state.currentHead,
				name: state.confirmedReleaseName,
				body: state.confirmedLog.join( "\n" )
			} );
			state.releaseUrl = htmlUrl;
		}
	};
};
