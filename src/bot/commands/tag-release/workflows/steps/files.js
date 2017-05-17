// TODO: This could come from the editorconfig in the project
const JSON_FILE_SPACES = 2;

const json = {
	serialize( value ) {
		return JSON.stringify( value, null, JSON_FILE_SPACES );
	},
	deserialize( value ) {
		return JSON.parse( value );
	}
};

module.exports = ( { slapp } ) => {
	return {
		createConfigIfMissing( state ) {
			const config = state.files[ state.filePaths.package ] || json.serialize( { version: "0.0.1" } );
			state.files[ state.filePaths.package ] = config;
		},
		createChangeLogIfMissing( state ) {
			const log = state.files[ state.filePaths.changeLog ] || "";
			state.files[ state.filePaths.changeLog ] = log;
		},
		updatePackageVersion( state ) {
			const path = state.filePaths.package;

			let pkg = {};
			try {
				const content = state.files[ path ];
				if ( !content ) {
					throw new Error( `Unable to find the ${ path } file.` );
				}

				pkg = json.deserialize( content );
				pkg.version = state.versions.current;

				state.files[ path ] = json.serialize( pkg );
			} catch ( err ) {
				throw new Error( `Unable to parse the package at '${ path }'` );
			}
		},
		updateChangeLog( state ) {
			const path = state.filePaths.changeLog;

			let content = state.files[ path ];
			if ( !content ) {
				// TODO: Create the change log if it doesn't exist
				return;
			}

			const version = `### ${ state.versions.current }`;
			const update = `${ version }\n\n${ state.answers.releaseLog.join( "\n" ) }`;
			const wildcardVersion = state.versions.current.replace( /\.\d+\.\d+/, ".x" );

			if ( state.answers.versionBump === "major" ) {
				content = `## ${ wildcardVersion }\n\n${ update }\n`;
			} else {
				content = content ?
					content.replace( /(## .*\n)/, `$1\n${ update }\n` ) :
					`## ${ wildcardVersion }\n\n${ update }\n`;
			}

			state.files[ path ] = content;
		}
	};
};
