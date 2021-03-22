#!/bin/bash

set -e

registry=perseushub.arcadialab.ru
branch=master

#WhiteRabbit
wrProdImage="white-rabbit-service"
wrDevImage="white-rabbit-service"
wrSrc=~/source/WhiteRabbit

#RServ
rservProdImage=r-serve
rservDevImage=r-serve_dev
rservSrc=~/source/DataQualityDashboard/R

#DQD
dqdProdImage="dqd-service"
dqdDevImage="dqd-service_dev"
dqdSrc=~/source/DataQualityDashboard

#Frontend
frontendProdImage=perseus-frontend
frontendStageImage=perseus-frontend_stage
frontendDevImage=perseus-frontend_dev
frontendSrc=~/source/CDMSouffleur/UI

#Backend
backendProdImage="perseus-backend"
backendDevImage="perseus-backend_dev"
backendStageImage="perseus-backend_stage"
backendSrc=~/source/CDMSouffleur

#Builder
builderProdImage="cdm-builder-service"
builderDevImage="cdm-builder-service_dev"
builderSrc=~/source/ETL-CDMBuilder

#DB
dbProdImage=perseus-database
dbDevImage=perseus-database_dev
dbSrc=~/source/CDMSouffleur/database

#setup
env=prod
backendImage=$backendProdImage
builderImage=$builderProdImage
dbImage=$dbProdImage
dqdImage=$dqdProdImage
frontendImage=$frontendProdImage
rservImage=$rservProdImage
wrImage=$wrProdImage

pullSrc (){
  echo [cd to $1]
  cd $1
  git checkout $2
  git pull
}

buildImage () {
  pullSrc $1 $branch   
  image=$2
  docker build -t $image .
}

buildRServ () {
  echo [BuildRserv $1 $2 $branch $env]
  pullSrc $1 $branch
  image=$2
  docker build -t $image --build-arg prop=$env .
}

buildCDMBuilder () {
  pullSrc $1 $branch
  image=$2
  docker build -f "source/org.ohdsi.cdm.presentation.builderwebapi/Dockerfile" -t $image .
}
	

buildDQD () {
  pullSrc $1 $branch
  chmod +x ./mvnw
  image=$2
  docker build -t $image --build-arg prop=$env .
}


buildImage $wrSrc $wrImage
buildRServ $rservSrc $rservImage
buildImage $frontendSrc $frontendImage
buildImage $backendSrc $backendImage 
buildCDMBuilder $builderSrc $builderImage
buildImage $dbSrc $dbImage
buildDQD   $dqdSrc $dqdImage


docker tag $wrImage $registry/$wrImage
docker tag $frontendImage $registry/$frontendImage
docker tag $backendImage $registry/$backendImage
docker tag $builderImage $registry/$builderImage
docker tag $dbImage $registry/$dbImage
docker tag $dqdImage $registry/$dqdImage
docker tag $rservImage $registry/$rservImage

docker login perseushub.arcadialab.ru -u="registryUser"

docker push $registry/$wrImage
docker push $registry/$rservImage
docker push $registry/$frontendImage
docker push $registry/$backendImage
docker push $registry/$builderImage
docker push $registry/$dbImage
docker push $registry/$dqdImage


docker logout
