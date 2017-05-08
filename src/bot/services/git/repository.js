module.exports = ( { log, fs, shell } ) => {
	class Repository {
		constructor( uri, dir = process.cwd() ) {
			this.uri = uri;
			this.dir = dir;
			this.defaultBranch = "develop";

			this.exec = ( cmd, args, { cwd = this.dir } = {} ) => {
				return shell.exec( cmd, args, { cwd } );
			};

			this.shell = ( cmd, { cwd = this.dir } = {} ) => {
				return shell.sh( cmd, { cwd } );
			};
		}

		exists() {
			return fs.exists( `${ this.dir }/.git` );
		}

		clone() {
			return this.exec( "git", [ "clone", "--depth", "20", this.uri, this.dir ], { cwd: process.cwd() } )
				.then( () => this );
		}

		fetch( options ) {
			return this.shell( `git fetch --depth 20 ${ options || "--all" }` )
				.then( () => this );
		}

		checkout( treeish ) {
			return this.fetch( "upstream" )
				// Checkout the branch
				.then( () => this.shell( `git checkout ${ treeish }` ) )
				// Prune the other branches so they're not polluting the repo
				.then( () => this.shell( `git branch | egrep -v "${ this.defaultBranch }|\\*" | xargs -n 1 git branch -d | 2>/dev/null` ) )
				.then( () => this );
		}

		getRemotes() {
			return this.shell( "git remote" )
				.then( output => output.trim().split( "\n" ) );
		}

		addRemote( remote, uri ) {
			return this.getRemotes()
				// .then( remotes => remotes.indexOf( remote ) >= 0 )
				.then( exists => this.shell( `git remote add ${ remote } "${ uri }"` ) )
				.then( () => this );
		}

		getBranches( remote ) {
			return this.fetch( remote )
				.then( () => this.shell( `git ls-remote --heads ${ remote } | sed 's?.*refs/heads/??'` ) )
				.then( output => output.trim().split( "\n" ) );
		}

		getCurrentBranch() {
			return this.shell( "git rev-parse --abbrev-ref HEAD" )
				.then( output => output.trim() );
		}

		merge( treeish ) {
			return this.shell( `git merge ${ treeish } --ff-only` )
				.then( () => this );
		}

		mergeUpstream( branch ) {
			return this.fetch( "upstream" )
				.then( () => this.checkout( branch ) )
				.then( () => this.merge( `upstream/${ branch }` ) )
				.then( () => this );
		}
	}

	return Repository;
};
