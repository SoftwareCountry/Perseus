#!/bin/bash

set -e
set -x

component=$1
env=$2
sshUser=arcuser
host=jnjcicdu1

if [ $env = "prod" ] 
then
  host=jnjdmdemou1
fi


echo Deploy [$component] to [$host] with user [$sshUser], env=[$env]. 
tar cf - perseus.sh perseus.h repo_pwd | ssh "$sshUser"@"$host" "tar xf -; bash -x -e perseus.sh deploy $component $env"
