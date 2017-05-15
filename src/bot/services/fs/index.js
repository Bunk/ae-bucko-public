const fs = require( "fs" );

module.exports = () => {
	const api = {
		readFile( path ) {
			if ( path ) {
				try {
					return fs.readFileSync( path, "utf-8" );
				} catch ( err ) {
					return null;
				}
			}
			return null;
		},
		readJSONFile( path ) {
			const content = this.readFile( path ) || "{}";
			return JSON.parse( content );
		}
	};
	return api;
};
