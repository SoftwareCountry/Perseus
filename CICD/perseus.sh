#!/bin/bash

# Script to manage Perseus application.
# Install Perseus: perseus.sh install YourRegistryPassword
# Uninstall Perseus: perseus.sh uninstall
# Start Perseus from images: perseus.sh start
# Stop Perseus and delete containers: perseus.sh stop

set -e

# DECLARATIONS
action=$1
repoPwd=$2
repoUrl=perseushub.arcadialab.ru

backend=perseus-backend
cdmb=cdm-builder-service
db=perseus-database
dqd=dqd-service
frontend=perseus-frontend
rserv=r-serve
wr=white-rabbit-service

backendImage=$repoUrl/$backend
cdmbImage=$repoUrl/$cdmb
dbImage=$repoUrl/$db
dqdImage=$repoUrl/$dqd
frontendImage=$repoUrl/$frontend
rservImage=$repoUrl/$rserv
wrImage=$repoUrl/$wr

dockerAction () {
  image=$1
  echo [$image]
  
  if [ $action = "stop" ]
  then
     echo "Stop and removing container $image..."
     docker rm $(docker stop $(docker ps -a -q --filter ancestor=$image)) || true
  elif [ $action = "uninstall" ]
  then
    echo "Stopping container $image and removing underlying images..."
    docker rm $(docker stop $(docker ps -a -q --filter ancestor=$image)) || true
    docker image rm -f $image

    echo "Cleanup images and volumes..."
    docker image prune -a -f || true
    docker volume prune -f || true
  
  else
    echo Wrong action value=[$action], can be "sc", "rc" or "ri".
  fi 

  echo Completed. 
  
}

deploy () {
  image=$1

  docker rm $(docker stop $(docker ps -a -q --filter ancestor=$image)) || true
  docker pull $image
}

startPerseus () {

  docker run --name $db -d -p 5431:5432 $dbImage
  docker run -e CDM_SOUFFLEUR_ENV='default' --name $backend -d --network host $backendImage
  docker run --name $frontend -d --network host $frontendImage
  docker run --name $wr -d --network host $wrImage
  docker run -d --network host --name $cdmb $cdmbImage
  docker run -d --network host --name $dqd $dqdImage
  docker run -d --network host --name $rserv -p 6311:6311 $rservImage
  echo Perseus was started.
}

installPerseus () {

  if [ -z "$repoPwd" ]
  then
    echo Repo password is empty. Please specify it like [perseus.sh install YourPassword]
    return -1
  fi

  docker login perseushub.arcadialab.ru -u="registryUser" -p="$repoPwd"
  deploy $cdmbImage
  deploy $dbImage
  deploy $dqdImage
  deploy $wrImage
  deploy $rservImage
  deploy $backendImage
  deploy $frontendImage
  docker logout

  echo Perseus was succefully installed. 
}


#MAIN

if [ $action = "install" ]
then
  installPerseus
  startPerseus
elif [ $action = "start" ]
then
  startPerseus
else
  dockerAction $wrImage
  dockerAction $rservImage
  dockerAction $frontendImage
  dockerAction $dqdImage
  dockerAction $cdmbImage
  dockerAction $dbImage
  dockerAction $backendImage
fi

bEnd=$(date +"%T")
echo "Finish "$bEnd

