#!/usr/bin/env bash 
set -xe

# install packages and dependencies
go get github.com/gorilla/websocket

# build command
go build -o bin/application *.go