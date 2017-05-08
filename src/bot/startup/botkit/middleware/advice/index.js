const _ = require( "lodash" );
const meld = require( "meld" );
const handleErrors = require( "./handleErrors" );
const promisify = require( "./promisify" );

function traverseObjects( obj, fn ) {
	_.forEach( obj, val => {
		if ( _.isPlainObject( val ) ) {
			fn( val ); // meld( val, /.*/, promisify );
			traverseObjects( val, fn );
		}
	} );
}

module.exports = ( app ) => ( {
	adviseBot( bot ) {
		traverseObjects( bot.api, obj => meld( obj, /.*/, promisify ) );
		meld( bot, [ "replyInteractive" ], promisify );
	},
	adviseController( controller ) {
		meld( controller, [ "hears", "on" ], handleErrors( app ) );
		traverseObjects( controller.storage, obj => meld( obj, [ "get", "save", "delete", "all" ], promisify ) );
	}
} );
