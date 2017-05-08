const _ = require( "lodash" );

module.exports = {
	around( joinpoint ) {
		const lastArg = joinpoint.args[ joinpoint.args.length - 1 ];
		if ( _.isFunction( lastArg ) ) {
			return joinpoint.proceed();
		}

		return new Promise( ( resolve, reject ) => {
			joinpoint.proceed( ...joinpoint.args, ( err, ...results ) => {
				if ( err ) {
					return reject( err );
				}
				return resolve( results.length === 1 ? results[ 0 ] : results );
			} );
		} );
	}
};
