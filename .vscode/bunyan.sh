#!/bin/sh

node $@ | ./node_modules/.bin/bunyan --color
