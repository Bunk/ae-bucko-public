const _ = require( "lodash" );
const flowsFactory = require( "./flows" );
const adviceFactory = require( "./advice" );

module.exports = ( app ) => {
	const { storage } = app;
	const advice = adviceFactory( app );
	const flows = flowsFactory( app );

	const api = ( state ) => ( {
		async execute( ...flow ) {
			app.log.debug( { flows: flow.map( f => ( f && f.name ) || undefined ) }, "Executing flows" );
			flow.forEach( flow => {
				if ( !flow || !_.isFunction( flow ) ) {
					throw new Error( "Attempt to execute a flow step that was not a function.  Flog the developer." );
				}
			} );

			// Save state as the last step of every flow
			flow.push( function storeState( value ) { // eslint-disable-line prefer-arrow-callback
				storage.set( value.id, value );
			} );

			// Add advice
			flow = flow.map( f => advice.advise( f ) );

			// Run all the flows
			await flow.reduce( ( promise, fn ) => promise.then( () => fn( state ) ), Promise.resolve() );

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
			if ( !state.answers.versionBump ) {
				return this.execute( ...flows.gatherVersionBump( msg ) );
			}
			if ( !state.answers.releaseLog ) {
				return this.execute( ...flows.gatherLogs( msg ) );
			}
			if ( !state.answers.releaseName ) {
				return this.execute( ...flows.gatherReleaseName( msg ) );
			}
			if ( !state.answers.releaseConfirmed ) {
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
