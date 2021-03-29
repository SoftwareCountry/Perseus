
registry=perseushub.arcadialab.ru

devBranch="development"
masterBranch="master"
stageBranch="staging"

frontendBranch=$devBranch
backendBranch=$devBranch
defaultBranch=$devBranch

#WhiteRabbit
wrProdImage="white-rabbit-service"
wrTestImage="white-rabbit-service_test"
wrSrc=~/source/WhiteRabbit

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
frontendSrc=~/source/Perseus/UI

#Backend
backendProdImage="perseus-backend"
backendDevImage="perseus-backend_dev"
backendStageImage="perseus-backend_stage"
backendTestImage="perseus-backend_test"
backendSrc=~/source/Perseus

#Builder
builderProdImage="cdm-builder-service"
builderDevImage="cdm-builder-service_dev"
builderTestImage="cdm-builder-service_test"
builderSrc=~/source/ETL-CDMBuilder

#DB
dbProdImage="perseus-database"
dbDevImage="perseus-database_dev"
dbTestImage="perseus-database_test"
dbSrc=~/source/Perseus/database

setEnv () {

   #Images
   backendImage=""
   builderImage=""
   dbImage=""
   dqdImage=""
   frontendImage=""
   rservImage=""
   wrImage=""

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

   env=$1
   dockerEnvProp=$env
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

   elif [ $env = "dev" ]
   then
     backendImage=$backendDevImage
     builderImage=$builderDevImage
     dbImage=$dbDevImage
     dqdImage=$dqdProdImage
     frontendImage=$frontendDevImage
     rservImage=$rservProdImage
     wrImage=$wrProdImage

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
   else
      echo Parameter [$env] is not supported.
      return -1
   fi

   if [ "$env" != "prod" ]
   then
     backend="$backend"_$env
     builder="$builder"_$env
     db="$db"_$env
     dqd="$dqd"_$env
     frontend="$frontend"_$env
     rserv="$rserv"_$env
     wr="$wr"_$env
   fi
}
