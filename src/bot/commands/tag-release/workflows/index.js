const flowsFactory = require( "./flows" );

module.exports = ( app ) => {
	const { storage } = app;
	const flows = flowsFactory( app );

	const api = ( state ) => ( {
		async execute( ...flow ) {
			// Save state as the last step of every flow
			flow.push( s => storage.set( s.id, s ) );
			// Run all the flows
			await flow.reduce( ( promise, fn ) => {
				return promise.then( () => fn( state ) );
			}, Promise.resolve() );
			return this;
		},
		async update( fn ) {
			fn( state );
			return this;
		},
		async resume( msg ) {
			if ( state.aborted ) {
				return this.execute( ...flows.aborted( msg ) );
			}
			if ( state.cancelled ) {
				return this.execute( ...flows.cancelled( msg ) );
			}
			if ( !state.validatedRepository ) {
				await this.execute( ...flows.validateRepository( msg ) );
			}
			if ( !state.confirmedVersionBump ) {
				return this.execute( ...flows.gatherVersionBump( msg ) );
			}
			if ( !state.confirmedLog ) {
				return this.execute( ...flows.gatherLogs( msg ) );
			}
			if ( !state.confirmedReleaseName ) {
				return this.execute( ...flows.gatherReleaseName( msg ) );
			}
			if ( !state.confirmedRelease ) {
				return this.execute( ...flows.confirmRelease( msg ) );
			}
			return this.execute( ...flows.release( msg ) );
		}
	} );

	return {
		async create( state ) {
			return api( state );
		},
		async lookup( id ) {
			const state = await storage.get( id );
			if ( !state ) {
				throw new Error( "Could not find this release's state.  Please try again." );
			}

			return api( state );
		}
	};
};
