#!/usr/bin/env sh
set -ex

apk upgrade
apk update

apk --no-cache add tini git openssh
npm install -g gulp

rm -rf /tmp/*
