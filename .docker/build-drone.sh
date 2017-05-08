#!/usr/bin/env sh
set -ex

apk upgrade
apk update
apk --no-cache add --virtual devs git

# Install dependencies while we have the right apk's installed
npm install
npm install buildgoggles@0.2.0-3

# Run the versioning plugin so that we can use Cowpoke
./node_modules/buildgoggles/bin/buildgoggles --releaseOwner=BanditSoftware --releaseBranch=master

# Cleanup
apk del devs
rm -rf /tmp/*
