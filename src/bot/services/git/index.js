/* eslint-disable global-require */
const Octokat = require( "octokat" );

const clientCache = {};

module.exports = ( { config, advice } ) => {
	function create( token ) {
		return new Octokat( {
			token,
			plugins: [
				require( "octokat/dist/node/plugins/object-chainer" ),
				require( "octokat/dist/node/plugins/path-validator" ),
				require( "octokat/dist/node/plugins/authorization" ),
				require( "octokat/dist/node/plugins/preview-apis" ),
				require( "octokat/dist/node/plugins/use-post-instead-of-patch" ),

				require( "octokat/dist/node/plugins/simple-verbs" ),
				require( "octokat/dist/node/plugins/fetch-all" ),

				require( "octokat/dist/node/plugins/read-binary" ),
				require( "octokat/dist/node/plugins/pagination" ),
				// Run cacheHandler after PagedResults so the link headers are remembered
				// but before hypermedia so the object is still serializable
				require( "./cache-handler" ),

				require( "octokat/dist/node/plugins/hypermedia" ),
				require( "octokat/dist/node/plugins/camel-case" )
			]
		} );
	}

	function getKey( msg ) {
		return msg.meta.team_id;
	}

	function getToken( msg ) {
		return config.github.token || msg.meta.config.GITHUB_TOKEN;
	}

	return ( msg ) => {
		const key = getKey( msg );
		if ( !clientCache[ key ] ) {
			const token = getToken( msg );
			clientCache[ key ] = create( token );
		}
		return clientCache[ key ];
	};
};
