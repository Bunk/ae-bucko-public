// TODO: This could come from the editorconfig in the project
const JSON_FILE_SPACES = 2;

module.exports = ( { slapp } ) => {
	return {
		updateConfig( state ) {
			let pkg = {};
			try {
				const content = state.files[ state.configPath ];
				if ( !content ) {
					throw new Error( `Unable to find the ${ state.configPath } file.` );
				}
				pkg = JSON.parse( content );
				pkg.version = state.currentVersion;

				state.files[ state.configPath ] = JSON.stringify( pkg, null, JSON_FILE_SPACES );
			} catch ( err ) {
				throw new Error( `Unable to parse a '${ state.configPath }' at revision ${ state.lastVersionTag }` );
			}
		},
		updateChangeLog( state ) {
			// TODO: Create the change log if it doesn't exist
			let content = state.files[ state.changeLogPath ];
			if ( !content ) {
				return;
			}

			const version = `### ${ state.currentVersion }`;
			const update = `${ version }\n\n${ state.confirmedLog.join( "\n" ) }`;
			const wildcardVersion = state.currentVersion.replace( /\.\d+\.\d+/, ".x" );

			if ( state.confirmedVersionBump === "major" ) {
				content = `## ${ wildcardVersion }\n\n${ update }\n`;
			} else {
				content = content ?
					content.replace( /(## .*\n)/, `$1\n${ update }\n` ) :
					`## ${ wildcardVersion }\n\n${ update }\n`;
			}

			state.files[ state.changeLogPath ] = content;
		}
	};
};
