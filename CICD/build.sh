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

buildRServ () {
  echo [BuildRserv $1 $2 $branch $env]
  pullSrc $1 $defaultBranch
  image=$2
  docker build -t $image --build-arg prop=$dockerEnvProp .
}

buildCDMBuilder () {
  pullSrc $1 $defaultBranch
  image=$2
  docker build -f "source/org.ohdsi.cdm.presentation.builderwebapi/Dockerfile" -t $image .
}


buildDQD () {
  pullSrc $1 $defaultBranch
  chmod +x ./mvnw
  image=$2
  docker build -t $image --build-arg prop=$dockerEnvProp .
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
          buildDQD $dqdSrc $image
          ;;
     "backend")
          image=$backendImage
          buildImage $backendSrc $image $backendBranch
          ;; 
     "frontend")
          image=$frontendImage
          buildImage $frontendSrc $image $frontendBranch
          ;;

     "rserv")
          image=$rservImage
          buildRServ $rservSrc $rservImage 
          ;;

     "builder")
          image=$builderImage
          buildCDMBuilder $builderSrc $image
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

