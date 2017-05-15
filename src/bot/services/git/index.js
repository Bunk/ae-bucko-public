// const github = require( "octonode" );
// const githubAdvice = require( "./advice" );
const Octokat = require( "octokat" );

module.exports = ( { config, advice } ) => {
	const client = new Octokat( { token: config.github.token } );
	return client;
	// const client = github.client( config.github.token );
	// return githubAdvice( advice ).adviseClient( client );
};
