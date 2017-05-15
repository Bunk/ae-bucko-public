/* eslint-disable global-require */
const _ = require( "lodash" );
// const requirePath = require( "require-path" );

// const requires = requirePath( {
// 	path: [ __dirname ],
// 	include: [ "**/*.js" ],
// 	exclude: [ "index.js" ]
// } );

module.exports = {
	async init( app ) {
		const modules = {
			status: require( "./status/status" ),
			statusGithub: require( "./status/github" ),
			tagRelease: require( "./tag-release" )
		};

		_.forEach( modules, ( module, fileName ) => {
			module( app );
		} );
	}
};
