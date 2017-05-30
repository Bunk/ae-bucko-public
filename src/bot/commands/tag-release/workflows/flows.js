const stepsFactory = require( "./steps" );
const questions = require( "./questions" );

module.exports = ( app ) => {
	const steps = stepsFactory( app );

	return {
		validateRepository: ( msg ) => [
			steps.slack( msg ).lookupUser,
			steps.github( msg ).validateAccess,
			steps.github( msg ).validateBranch( state => state.branches.base ),
			steps.github( msg ).validateBranch( state => state.branches.head ),
			steps.github( msg ).fetchContents( state => state.filePaths.package, state => state.branches.base ),
			steps.github( msg ).fetchContents( state => state.filePaths.changeLog, state => state.branches.base ),
			steps.files.createConfigIfMissing,
			steps.files.createChangeLogIfMissing,
			steps.github( msg ).getLatestVersion,
			function validatedRepository( state ) {
				state.validatedRepository = true;
			}
		],
		gatherVersionBump: ( msg ) => [
			steps.slack( msg ).ask( questions.confirmVersionBump )
		],
		gatherLogs: ( msg ) => [
			steps.github( msg ).getDefaultReleaseLog,
			steps.github( msg ).validateDefaultReleaseLog,
			steps.slack( msg ).ask( questions.confirmLogs )
		],
		gatherReleaseName: ( msg ) => [
			steps.github( msg ).getDefaultReleaseName,
			steps.slack( msg ).ask( questions.confirmReleaseName )
		],
		confirmRelease: ( msg ) => [
			steps.bumpVersion,
			steps.slack( msg ).ask( questions.confirmRelease )
		],
		release: ( msg ) => [
			steps.files.updatePackageVersion,
			steps.files.updateChangeLog,
			steps.github( msg ).stageFile( state => state.filePaths.package ),
			steps.github( msg ).stageFile( state => state.filePaths.changeLog ),
			steps.github( msg ).branchFrom( state => `heads/${ state.branches.head }` ),
			steps.github( msg ).commitStaged,
			steps.github( msg ).openPullRequest( state => state.branches.current ),
			steps.github( msg ).mergePullRequest( "rebase" ),
			steps.github( msg ).mergeFastForward( state => state.branches.base ),
			steps.github( msg ).tagVersion,
			steps.github( msg ).createRelease,
			steps.github( msg ).deleteBranch( state => state.branches.current ),
			steps.deleteState,
			steps.slack( msg ).say( questions.released, { deleteOriginal: true } )
		],
		aborted: ( msg ) => [
			steps.github( msg ).closePullRequest,
			steps.github( msg ).deleteBranch,
			steps.deleteState
		],
		cancelled: ( msg ) => [
			steps.github( msg ).closePullRequest,
			steps.github( msg ).deleteBranch,
			steps.deleteState,
			steps.slack( msg ).say( () => {}, { deleteOriginal: true } )
		]
	};
};
