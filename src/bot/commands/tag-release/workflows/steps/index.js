const semver = require( "semver" );
const slackSteps = require( "./slack" );
const githubSteps = require( "./github" );
const fileSteps = require( "./files" );

module.exports = ( app ) => {
	const { storage } = app;
	return {
		github: githubSteps( app ),
		slack: slackSteps( app ),
		files: fileSteps( app ),
		bumpVersion( state ) {
			const { lastVersion, confirmedVersionBump } = state;
			const bumped = semver.inc( lastVersion, confirmedVersionBump );
			if ( !bumped ) {
				throw new Error( `Couldn't bump version '${ lastVersion }' as a ${ confirmedVersionBump } release` );
			}

			state.currentVersion = bumped;
			state.currentVersionTag = `v${ bumped }`;
		},
		storeState( state ) {
			return storage.set( state.id, state );
		},
		async deleteState( state ) {
			if ( state && state.id ) {
				await storage.del( state.id );
			}
		}
	};
};
