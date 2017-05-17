const meld = require( "meld" );
const logExecutionFactory = require( "./logExecution" );

module.exports = ( app ) => {
	const logExecution = logExecutionFactory( app );
	return {
		advise( obj ) {
			return meld( obj, logExecution );
		}
	};
};
