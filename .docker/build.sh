#!/usr/bin/env sh
set -ex

apk upgrade
apk update

apk --no-cache add tini

npm install
npm run build
npm prune --production

# apk del devs
rm -rf /tmp/*
