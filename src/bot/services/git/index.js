const _ = require( "lodash" );
const GitHub = require( "github-api" );
const repositoryFactory = require( "./repository" );

module.exports = ( app ) => {
	const rootDir = app.config.github.repositories.dir;
	const Repository = repositoryFactory( app );

	return ( name = "upstream" ) => {
		const cfg = app.config.github.repositories[ name ];
		const api = {
			name: cfg.name,
			user: cfg.user,
			token: cfg.token,
			get uri() {
				const tmpl = cfg.tmpl || ( cfg.tmpl = _.template( cfg.uri ) );
				return tmpl( cfg );
			},
			hub() {
				return new GitHub( { token: cfg.token } );
			},
			repository() {
				const dir = `${ rootDir }/${ name }`;
				return new Repository( api.uri, dir );
			}
		};
		return api;
	};
};
