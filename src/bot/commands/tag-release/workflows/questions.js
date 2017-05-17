function encode( state, value ) {
	return JSON.stringify( { id: state.id, value } );
}

const preformatted = val => `\`\`\`\n${ val }\n\`\`\``;

module.exports = {
	confirmVersionBump( state ) {
		return {
			attachments: [ {
				text: "What type of release is this?",
				callback_id: "tag-release",
				actions: [
					{ name: "confirm_version_bump", text: "Major", type: "button", value: encode( state, "major" ) },
					{ name: "confirm_version_bump", text: "Minor", type: "button", value: encode( state, "minor" ) },
					{ name: "confirm_version_bump", text: "Patch", type: "button", value: encode( state, "patch" ) }
				]
			} ]
		};
	},
	confirmReleaseName( state ) {
		return {
			attachments: [ {
				pretext: "Here is a preview of your release name:",
				text: preformatted( state.defaults.releaseName ),
				mrkdwn_in: [ "text" ],
				callback_id: "tag-release",
				actions: [
					{ name: "confirm_edit_name", text: "Confirm", type: "button", style: "primary", value: encode( state, "confirm" ) },
					{ name: "confirm_edit_name", text: "Cancel", type: "button", value: encode( state, "cancel" ) }
				]
			} ]
		};
	},
	confirmLogs( state ) {
		return {
			attachments: [ {
				pretext: "Here is a preview of your release change log:",
				text: preformatted( state.defaults.releaseLog.join( "\n" ) ),
				mrkdwn_in: [ "text" ],
				callback_id: "tag-release",
				actions: [
					{ name: "confirm_edit_log", text: "Confirm", type: "button", style: "primary", value: encode( state, "confirm" ) },
					{ name: "confirm_edit_log", text: "Cancel", type: "button", value: encode( state, "cancel" ) }
				]
			} ]
		};
	},
	confirmRelease( state ) {
		return {
			attachments: [ {
				pretext: "Please confirm this release:",
				title: state.answers.releaseName,
				footer: `@${ state.author.name }`,
				footer_icon: state.author.icon,
				mrkdwn_in: [ "pretext", "fields" ],
				fields: [
					{ value: preformatted( state.answers.releaseLog.join( "\n" ) ) },
					{ title: "Project", value: `${ state.repo.user }/${ state.repo.name }`, short: true },
					{ title: "Version", value: state.versions.current, short: true }
				],
				callback_id: "tag-release",
				actions: [
					{ name: "confirm_release", text: "Confirm", type: "button", style: "primary", value: encode( state, "confirm" ) },
					{ name: "confirm_release", text: "Cancel", type: "button", value: encode( state, "cancel" ) }
				]
			} ]
		};
	},
	released( state ) {
		return {
			text: "Release created:",
			attachments: [ {
				color: "#93c540",
				title: `${ state.release.name }`,
				title_link: state.release.url,
				footer: `@${ state.author.name }`,
				footer_icon: state.author.icon,
				mrkdwn_in: [ "title", "fields" ],
				fields: [
					{ value: preformatted( state.release.body ), short: false },
					{ title: "Project", value: `${ state.repo.user }/${ state.repo.name }`, short: true },
					{ title: "Version", value: state.versions.current, short: true }
				],
				ts: Math.round( Date.now() / 1000 )
			} ]
		};
	}
};
