#!/bin/bash

# $1 - component to build (wr, dqd, db, ...)
# $2 - env (dev, prod)

set -e

source perseus.h

#setup
env=$2

pullSrc (){
  echo Pulling sources from branch=[$2]
  cd $1
  git checkout $2
  git pull
}

buildImage () {
  source=$1
  branch=$3
  image=$2
  echo Build image: source=[$source] branch=[$branch] image=[$image]
  pullSrc $source $branch
  docker build -t $image .
}

buildFrontend () {
  echo Build fronend image: source=[$frontendSource] branch=[$frontendBranch] image=[$frontendImage]
  pullSrc $frontendSrc $frontendBranch
  
  if [ $env = "dev" ]
  then
     docker build -t $frontendImage -f Dockerfile.dev .
  elif [ $env = "stage" ]
  then
     docker build -t $frontendImage -f Dockerfile.stage .
  elif [ $env = "prod" ]
  then
     docker build -t $frontendImage . 
  fi
}

buildRServ () {
  echo Building RServe image=[$rservImage]
  pullSrc $rservSrc $defaultBranch
  docker build -t $rservImage --build-arg prop=$dockerEnvProp .
}

buildCDMBuilder () {
  echo Building CDM Builder image=[$builderImage]
  pullSrc $builderSrc $defaultBranch
  docker build -f "source/org.ohdsi.cdm.presentation.builderwebapi/Dockerfile" -t $builderImage .
}

buildDQD () {
  echo Building DQD image=[$dqdImage]
  pullSrc $dqdSrc $defaultBranch
  chmod +x ./mvnw
  docker build -t $dqdImage --build-arg prop=$dockerEnvProp .
}

tagAndPush () {
  image=$1
  docker tag $image $registry/$image
  docker login perseushub.arcadialab.ru -u="registryUser" -p="eV9wDRjIB1BflWfV"
  docker push $registry/$image
  docker logout perseushub.arcadialab.ru 
}

build () {
  comp=$1
  image=""
  case $comp in
     "wr")
          image=$wrImage
          buildImage $wrSrc $image $defaultBranch
          ;;
     "dqd")
          image=$dqdImage
          buildDQD
          ;;
     "backend")
          image=$backendImage
          buildImage $backendSrc $image $backendBranch
          ;; 
     "frontend")
          image=$frontendImage
          buildFrontend 
          ;;

     "rserv")
          image=$rservImage
          buildRServ
          ;;

     "builder")
          image=$builderImage
          buildCDMBuilder
          ;;

     "db")
          image=$dbImage
          buildImage $dbSrc $dbImage $defaultBranch
          ;;

     *)
          echo "Parameter [$1] is not supported."
          return -1
          ;;
  esac

  echo [$image] was successfully built for [$env] environment. 
  tagAndPush $image
}

setEnv $env
build $1

