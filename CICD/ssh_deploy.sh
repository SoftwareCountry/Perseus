#!/bin/bash

sshUser=$1
host=$2
component=$3
env=$4

echo Deploy [$component] to [$host] with user [$sshUser], env=[$env]. 
tar cf - perseus.sh perseus.h repo_pwd | ssh $sshUse@$host "tar xf -; bash perseus.sh deploy $component $env"
