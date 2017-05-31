# ae-bucko
LeanKit automation engineer's deployment pipeline chatops bot

## ChatOps

### Create Release

> /bucko create release {owner}/{repository} [--head {branchHead} --base {branchBase} --log "Comma,delimited,list,of,release notes" --name "Release name to use"]

This will run the tag-release process inside of GitHub for the targetted repository.  This is the general process:
1. updatePackageVersion
1. updateChangeLog
1. branchFrom( state => `heads/${ state.branches.head }` )
1. commitStaged
1. openPullRequest( state => state.branches.current )
1. mergePullRequest( "rebase" )
1. mergeFastForward( state => state.branches.base )
1. tagVersion
1. createRelease
1. deleteBranch
