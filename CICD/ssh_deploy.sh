#!/bin/bash

component=$1
env=$2
sshUser=arcuser
host=jnjcicdu1

if [ $env = "prod" ] 
then
  host=JnJDMdemoU1
fi


echo Deploy [$component] to [$host] with user [$sshUser], env=[$env]. 
tar cf - perseus.sh perseus.h repo_pwd | ssh "$sshUser"@"$host" "tar xf -; bash perseus.sh deploy $component $env"
