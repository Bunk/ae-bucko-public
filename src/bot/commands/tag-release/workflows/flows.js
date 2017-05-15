const stepsFactory = require( "./steps" );
const questions = require( "./questions" );

module.exports = ( app ) => {
	const steps = stepsFactory( app );

	return {
		validateRepository: ( msg ) => [
			steps.github.validateAccess,
			steps.github.validateBranch( "develop" ),
			steps.slack( msg ).lookupUser,
			( state ) => ( state.validatedRepository = true )
		],
		gatherLogs: ( msg ) => [
			steps.github.getShortLog,
			steps.slack( msg ).ask( questions.confirmLogs )
		],
		gatherVersionBump: ( msg ) => [
			steps.github.getLatestVersion,
			steps.slack( msg ).ask( questions.confirmVersionBump )
		],
		gatherReleaseName: ( msg ) => [
			steps.github.getDefaultReleaseName,
			steps.slack( msg ).ask( questions.confirmReleaseName )
		],
		confirmRelease: ( msg ) => [
			steps.bumpVersion,
			steps.slack( msg ).ask( questions.confirmRelease )
		],
		release: ( msg ) => [
			// Update package.json
			steps.github.fetchContents( state => state.configPath ),
			steps.files.updateConfig,
			steps.github.stageFile( state => state.configPath ),
			// Update changelog.md
			steps.github.fetchContents( state => state.changeLogPath ),
			steps.files.updateChangeLog,
			steps.github.stageFile( state => state.changeLogPath ),
			// Commit the changes in a PR off of 'develop' so that we can
			// rebase merge them.
			steps.github.branchFrom( "develop" ),
			steps.github.commitStaged,
			steps.github.openPullRequest,
			steps.github.mergePullRequest( "rebase" ),
			// Pull /heads/master up to the new rebased develop
			steps.github.mergeFastForward( "heads/master" ),
			// Tag & Release what we just merged
			steps.github.tagVersion,
			steps.github.createRelease,
			steps.github.deleteBranch,
			steps.deleteState,
			steps.slack( msg ).say( questions.released, { deleteOriginal: true } )
		],
		aborted: ( msg ) => [
			steps.github.closePullRequest,
			steps.github.deleteBranch,
			steps.deleteState
		],
		cancelled: ( msg ) => [
			steps.github.closePullRequest,
			steps.github.deleteBranch,
			steps.deleteState,
			steps.slack( msg ).say( () => {}, { deleteOriginal: true } )
		]
	};
};
