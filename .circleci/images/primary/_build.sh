#!/usr/bin/env sh
set -ex

apk upgrade
apk update

apk --no-cache add docker git openssh curl openrc

rm -rf /tmp/*
