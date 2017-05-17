/* eslint-disable max-lines */
const uuidV4 = require( "uuid/v4" );
const yargs = require( "yargs-parser" );
const workflowFactory = require( "./workflows" );

module.exports = ( app ) => {
	const { slapp } = app;
	const workflow = workflowFactory( app );

	function onError( err, msg ) {
		msg.respond( `:sweat: Woops!  \`${ err.message }\`\n\`\`\`${ err.stack }\`\`\`` );
	}

	slapp.command( "/bucko", "create release (.*)/([^\\s]+)(.*)", ( msg, text, repoUser, repoName, opt ) => {
		const params = opt.trim();
		const { name, log, base, head } = yargs( params );

		const state = {
			id: `${ msg.meta.team_id }|tagrelease|${ uuidV4() }`,
			teamId: msg.meta.team_id,
			channelId: msg.meta.channel_id,
			authorId: msg.meta.user_id,
			command: {
				name: "/bucko create release",
				opts: opt
			},
			repo: { user: repoUser, name: repoName },
			versions: {
				latest: undefined,
				current: undefined
			},
			branches: {
				base: "master",
				head: "develop"
			},
			filePaths: {
				package: "package.json",
				changeLog: "CHANGELOG.md"
			},
			refs: {},
			defaults: {},
			answers: {},
			files: {},
			staged: []
		};

		if ( base && base.length ) {
			state.branches.base = base;
		}

		if ( head && head.length ) {
			state.branches.head = head;
		}

		if ( name && name.length ) {
			state.answers.releaseName = name;
		}

		if ( log && log.length ) {
			state.answers.releaseLog = log.split( "," ).map( n => `* ${ n.trim() }` );
		}

		workflow
			.create( state )
			.then( api => api.resume( msg ) )
			.catch( err => onError( err, msg ) );
	} );

	function helpStep( msg, context, text ) {
		return ( state ) => {
			msg.respond(
				`If you want to specify ${ context }, you'll need to specify it as a part of the command (for now):\n\n` +
				`\`\`\`${ state.command.name } ${ state.repo.user }/${ state.repo.name } ${ text }\`\`\``
			);
		};
	}

	slapp.action( "tag-release", "confirm_edit_log", async ( msg, data ) => {
		const { id, value } = JSON.parse( data );
		if ( value === "confirm" ) {
			workflow.lookup( id )
				.then( api => api.update( state => ( state.answers.releaseLog = state.defaults.releaseLog ) ) )
				.then( api => api.resume( msg ) )
				.catch( err => onError( err, msg ) );
		} else {
			workflow.lookup( id )
				.then( api => api.execute(
					helpStep( msg, "your release changelog", "--log \"release note 1, release note 2,etc.\"" ) )
				)
				.then( api => api.update( state => ( state.aborted = true ) ) )
				.then( api => api.resume( msg ) )
				.catch( err => onError( err, msg ) );
		}
	} );

	slapp.action( "tag-release", "confirm_edit_name", async ( msg, data ) => {
		const { id, value } = JSON.parse( data );
		if ( value === "confirm" ) {
			workflow.lookup( id )
				.then( api => api.update( state => ( state.answers.releaseName = state.defaults.releaseName ) ) )
				.then( api => api.resume( msg ) )
				.catch( err => onError( err, msg ) );
		} else {
			workflow.lookup( id )
				.then( api => api.execute(
					helpStep( msg, "your release name", "--name \"release name\"" ) )
				)
				.then( api => api.update( state => ( state.aborted = true ) ) )
				.then( api => api.resume( msg ) )
				.catch( err => onError( err, msg ) );
		}
	} );

	slapp.action( "tag-release", "confirm_version_bump", ( msg, data ) => {
		const { id, value } = JSON.parse( data );
		workflow.lookup( id )
			.then( api => api.update( state => ( state.answers.versionBump = value ) ) )
			.then( api => api.resume( msg ) )
			.catch( err => onError( err, msg ) );
	} );

	slapp.action( "tag-release", "confirm_release", ( msg, data ) => {
		const { id, value } = JSON.parse( data );

		let flow = workflow.lookup( id );
		if ( value === "confirm" ) {
			flow = flow.then( api => api.update( state => ( state.answers.releaseConfirmed = true ) ) );
		} else {
			flow = flow.then( api => api.update( state => ( state.cancelled = true ) ) );
		}

		flow.then( api => api.resume( msg ) )
			.catch( err => onError( err, msg ) );
	} );
};
