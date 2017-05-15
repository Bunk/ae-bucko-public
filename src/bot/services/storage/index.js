const persistFactory = require( "beepboop-persist" );
const meld = require( "meld" );

module.exports = ( { advice } ) => {
	const kv = persistFactory();

	meld( kv, [ "get", "set", "del" ], advice.promisify( results => results[ 0 ] ) );

	return kv;
};
