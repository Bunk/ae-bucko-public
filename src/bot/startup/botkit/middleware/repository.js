module.exports = ( { config, log, git } ) => {
	const repositories = {};

	async function openRepository( repo, bot ) {
		const exists = await repo.exists();
		if ( !exists ) {
			log.info( { repo }, "Existing repository not found.  Cloning new repository." );
			bot.say( "Cloning a new repository.  This may take a minute or so..." );

			await repo.clone();
			await repo.addRemote( "upstream", repo.uri );
		}
		return repo;
	}

	return ( bot, next ) => {
		bot.openRepository = ( name ) => {
			if ( !repositories[ name ] ) {
				const repo = git( name ).repository();
				repositories[ name ] = openRepository( repo, bot );
			}
			return repositories[ name ];
		};
	};
};
