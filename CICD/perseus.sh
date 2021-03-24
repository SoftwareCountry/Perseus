#!/bin/bash

# Script to manage Perseus application.
# Install Perseus: perseus.sh install
# Uninstall Perseus: perseus.sh uninstall
# Start Perseus from images: perseus.sh start
# Stop Perseus and delete containers: perseus.sh stop
# Deploy a component: perseus.sh deploy componentName
# ComponentName can be wr, db, dqd, builder, frontend, backend, rserv
# Deploy means that existing container will be stopped, removed, pulled from regustry and run.

set -e

source perseus.h

# DECLARATIONS
action=$1
repoPwd=$(<repo_pwd)


setImages () {
  backendImage=$registry/$backendImage
  builderImage=$registry/$builderImage
  dbImage=$registry/$dbImage
  dqdImage=$registry/$dqdImage
  frontendImage=$registry/$frontendImage
  rservImage=$registry/$rservImage
  wrImage=$registry/$wrImage
}

dockerAction () {
  image=$1
  echo [$image $action]

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
  echo Deploy image [$image].

  docker rm $(docker stop $(docker ps -a -q --filter ancestor=$image)) || true

  docker login perseushub.arcadialab.ru -u="registryUser" -p="$repoPwd"
  docker pull $image
  docker logout perseushub.arcadialab.ru
}

start () {
 
  comp=$1
  echo Start [$comp].
  case $comp in
     "wr")
          docker run --name $wr -d --network host $wrImage
          ;;
     "dqd")
          docker run -d --network host --name $dqd $dqdImage
          ;;
     "backend")
          docker run -e CDM_SOUFFLEUR_ENV='default' --name $backend -d --network host $backendImage
          ;;
     "frontend")
          docker run --name $frontend -d --network host $frontendImage
          ;;

     "rserv")
          docker run -d --network host --name $rserv -p 6311:6311 $rservImage
          ;;

     "builder")
          docker run -d --network host --name $builder $builderImage
          ;;

     "db")
          docker run --name $db -d -p 5431:5432 $dbImage
          ;;
     *)
          echo "Parameter [$1] is not supported."
          return -1
          ;;
  esac
}

startPerseus () {

  echo Starting Perseus...
  start db
  start backend
  start frontend
  start wr
  start builder
  start dqd
  start rserv
 
  echo Perseus was started.
}

installPerseus () {

  if [ -z "$repoPwd" ]
  then
    echo Repo password is empty. Please specify it like [perseus.sh install YourPassword]
    return -1
  fi

  echo Installing Perseus.
  deploy $builderImage
  deploy $dbImage
  deploy $dqdImage
  deploy $wrImage
  deploy $rservImage
  deploy $backendImage
  deploy $frontendImage

  echo Perseus was succefully installed.
}


#MAIN

setEnv prod
setImages

if [ $action = "install" ]
then
  installPerseus
  startPerseus
elif [ $action = "start" ]
then
  startPerseus
elif [ $action = "deploy" ]
then
  component=$2
  compImage="$component"Image 
  compImage=${!compImage}
  deploy $compImage
  start  $component
else
  dockerAction $wrImage
  dockerAction $rservImage
  dockerAction $frontendImage
  dockerAction $dqdImage
  dockerAction $builderImage
  dockerAction $dbImage
  dockerAction $backendImage
fi

bEnd=$(date +"%T")
echo "Finish "$bEnd

