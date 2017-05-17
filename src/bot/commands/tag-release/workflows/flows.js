const stepsFactory = require( "./steps" );
const questions = require( "./questions" );

module.exports = ( app ) => {
	const steps = stepsFactory( app );

	return {
		validateRepository: ( msg ) => [
			steps.slack( msg ).lookupUser,
			steps.github.validateAccess,
			steps.github.validateBranch( state => state.branches.base ),
			steps.github.validateBranch( state => state.branches.head ),
			steps.github.fetchContents( state => state.filePaths.package, state => state.branches.base ),
			steps.github.fetchContents( state => state.filePaths.changeLog, state => state.branches.base ),
			steps.files.createConfigIfMissing,
			steps.files.createChangeLogIfMissing,
			steps.github.getLatestVersion,
			function validatedRepository( state ) {
				state.validatedRepository = true;
			}
		],
		gatherVersionBump: ( msg ) => [
			steps.slack( msg ).ask( questions.confirmVersionBump )
		],
		gatherLogs: ( msg ) => [
			steps.github.getDefaultReleaseLog,
			steps.github.validateDefaultReleaseLog,
			steps.slack( msg ).ask( questions.confirmLogs )
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
			steps.files.updatePackageVersion,
			steps.files.updateChangeLog,
			steps.github.stageFile( state => state.filePaths.package ),
			steps.github.stageFile( state => state.filePaths.changeLog ),
			steps.github.branchFrom( state => state.refs.current ),
			steps.github.commitStaged,
			steps.github.openPullRequest( state => state.branches.current ),
			steps.github.mergePullRequest( "rebase" ),
			steps.github.mergeFastForward( state => state.branches.base ),
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
