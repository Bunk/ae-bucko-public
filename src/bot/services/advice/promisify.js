const _ = require( "lodash" );

module.exports = ( handleResultFn = _.identity ) => ( {
	around( joinpoint ) {
		const lastArg = joinpoint.args[ joinpoint.args.length - 1 ];

		// If this looks like it's being called with node-style callbacks
		// fall back on the normal behavior.
		if ( _.isFunction( lastArg ) ) {
			return joinpoint.proceed();
		}

		// Otherwise, let's treat this as though it's a promise and wrap the callback.
		return new Promise( ( resolve, reject ) => {
			joinpoint.proceed( ...joinpoint.args, ( err, ...results ) => {
				if ( err ) {
					return reject( err );
				}
				return resolve( handleResultFn( results ) );
			} );
		} );
	}
} );
