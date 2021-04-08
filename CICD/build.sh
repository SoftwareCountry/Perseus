#!/bin/bash

# $1 - component to build (wr, dqd, db, ...)
# $2 - env (dev, prod)

set -e
set -x

source perseus.h

#setup
env=$2

pullSrc (){
  sourcesPath=$1
  branch=$2
  currentBranch=$branch
  echo Pulling sources from branch=[$branch]
  cd $sourcesPath
  git checkout $branch
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

buildDB () {
  echo Building DB image=[$dbImage], vocabulary url=[$vocabularyUrl]
  pullSrc $dbSrc $defaultBranch
  docker build -t $dbImage --build-arg voc_url=$vocabularyUrl .
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
          buildDB
          ;;

     *)
          echo "Parameter [$1] is not supported."
          return -1
          ;;
  esac

  echo [$image] was successfully built for [$env] environment. 
  tagAndPush $image
  currentImage=$image
}

setEnv $env
build $1

