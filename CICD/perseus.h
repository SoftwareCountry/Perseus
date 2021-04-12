# Project defines.

registry=perseushub.arcadialab.ru
buildSourcesDir=${BUILD_SOURCESDIRECTORY}

devBranch="development"
masterBranch="master"
stageBranch="staging"
currentBranch=""

frontendBranch=$devBranch
backendBranch=$devBranch
defaultBranch=$devBranch

#WhiteRabbit
wrProdImage="white-rabbit-service"
wrTestImage="white-rabbit-service_test"
wrSrc=$buildSourcesDir

#RServ
rservProdImage="r-serve"
rservTestImage="r-serve_test"
rservSrc=~/source/DataQualityDashboard/R

#DQD
dqdProdImage="dqd-service"
dqdTestImage="dqd-service_test"
dqdSrc=~/source/DataQualityDashboard

#Frontend
frontendProdImage="perseus-frontend"
frontendStageImage="perseus-frontend_stage"
frontendDevImage="perseus-frontend_dev"
frontendTestImage="perseus-frontend_test"
frontendSrc=$buildSourcesDir/UI

#Backend
backendProdImage="perseus-backend"
backendDevImage="perseus-backend_dev"
backendStageImage="perseus-backend_stage"
backendTestImage="perseus-backend_test"
backendSrc=$buildSourcesDir

#Builder
builderProdImage="cdm-builder-service"
builderDevImage="cdm-builder-service_dev"
builderTestImage="cdm-builder-service_test"
builderSrc=~/source/ETL-CDMBuilder

#DB
dbProdImage="perseus-database"
dbDevImage="perseus-database_dev"
dbTestImage="perseus-database_test"
dbSrc=$buildSourcesDir/database
vocabularyUrl=$VOCABULARY

setEnv () {

   echo VocabularyUrl=[$vocabularyUrl]
   echo build sources=[$buildSourcesDir]

   #Images
   backendImage=""
   builderImage=""
   dbImage=""
   dqdImage=""
   frontendImage=""
   rservImage=""
   wrImage=""
   currentImage=""

   #Services' names.
   backend="perseus-backend"
   builder="cdm-builder-service"
   db="perseus-database"
   dqd="dqd-service"
   frontend="perseus-frontend"
   rserv="r-serve"
   wr="white-rabbit-service" 

   #Docker build props
   dockerEnvProp="dev"
   cdmSouffleurEnv="default"
   frontServer="10.110.1.7"
   frontDBServer="10.110.1.7"

   env=$1
   echo Setting environment [$env].

   if [ $env = "prod" ]
   then
     backendImage=$backendProdImage
     builderImage=$builderProdImage
     dbImage=$dbProdImage
     dqdImage=$dqdProdImage
     frontendImage=$frontendProdImage
     rservImage=$rservProdImage
     wrImage=$wrProdImage

     frontendBranch=$masterBranch
     backendBranch=$masterBranch
     defaultBranch=$masterBranch

     dockerEnvProp="prod"
     frontServer="185.134.75.47"
     frontDBServer="192.168.20.47"

   elif [ $env = "dev" ]
   then
     backendImage=$backendDevImage
     builderImage=$builderDevImage
     dbImage=$dbDevImage
     dqdImage=$dqdProdImage
     frontendImage=$frontendDevImage
     rservImage=$rservProdImage
     wrImage=$wrProdImage

     cdmSouffleurEnv="development"

   elif [ $env = "stage" ]
   then
     backendImage=$backendStageImage
     builderImage=$builderDevImage
     dbImage=$dbDevImage
     dqdImage=$dqdProdImage
     frontendImage=$frontendStageImage
     rservImage=$rservProdImage
     wrImage=$wrProdImage

     frontendBranch=$stageBranch
     backendBranch=$stageBranch

   elif [ $env = "test" ]
   then
     backendImage=$backendTestImage
     builderImage=$builderTestImage
     dbImage=$dbTestImage
     dqdImage=$dqdTestImage
     frontendImage=$frontendTestImage
     rservImage=$rservTestImage
     wrImage=$wrTestImage
 
     dockerEnvProp="dev"
     cdmSouffleurEnv="development"
   else
      echo Parameter [$env] is not supported.
      return -1
   fi

   if [ "$env" != "prod" ]
   then
     backend="$backend"_$env
     frontend="$frontend"_$env
   fi

   if [ "$env" = "dev" ] || [ "$env" = "stage" ]
   then
     db="$db"_"dev"
   fi

}
