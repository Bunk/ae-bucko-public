const aupair = require( "aupair" );
const ApiDependency = require( "aupair-api" );

const githubStatus = {
	good: { healthy: true },
	minor: { healthy: true, degraded: true },
	major: { healthy: false }
};

const dependency = new ApiDependency( {
	name: "GitHub",
	uri: "https://status.github.com/api/last-message.json",
	transforms: {
		response( response ) {
			const status = githubStatus[ response.body.status ] || { healthy: false };
			return {
				healthy: status.healthy,
				degraded: status.degraded,
				message: status.healthy ? response.body.body : undefined,
				error: status.healthy ? undefined : new Error( response.body.body ),
				timestamp: response.created_on
			};
		}
	}
} );

module.exports = ( { log } ) => {
	log.info( { dependency }, "Registered health monitor: GitHub" );
	aupair.register( dependency );
};
