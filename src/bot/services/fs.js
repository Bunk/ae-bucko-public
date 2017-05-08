const fs = require( "fs" );

module.exports = {
	exists( dir ) {
		return new Promise( ( resolve, reject ) => {
			fs.stat( dir, ( err ) => {
				if ( err ) {
					return err.code === "ENOENT" ? resolve( false ) : reject( err );
				}
				return resolve( true );
			} );
		} );
	}
};
