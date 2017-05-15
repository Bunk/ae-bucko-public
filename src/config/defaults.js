/* eslint-disable no-template-curly-in-string */
module.exports = {
	web: {
		port: process.env.PORT || 8000
	},
	log: {
		level: process.env.LOG_LEVEL || "info"
	},
	github: {
		token: process.env.GITHUB_TOKEN || ""
	},
	slack: {
		verificationToken: process.env.SLACK_VERIFY_TOKEN || ""
	}
};
