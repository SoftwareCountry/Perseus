registry=perseushub.arcadialab.ru
branch=master

#WhiteRabbit
wrProdImage="white-rabbit-service"
wrDevImage="white-rabbit-service"
wrTestImage="white-rabbit-service_test"
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

#Images
backendImage=""
builderImage=""
dbImage=""
dqdImage=""
frontendImage=""
rservImage=""
wrImage=""

#Services' names.
backend=perseus-backend
builder=cdm-builder-service
db=perseus-database
dqd=dqd-service
frontend=perseus-frontend
rserv=r-serve
wr=white-rabbit-service


setEnv () {
   env=$1

   if [ $env = "prod" ]
   then
     backendImage=$backendProdImage
     builderImage=$builderProdImage
     dbImage=$dbProdImage
     dqdImage=$dqdProdImage
     frontendImage=$frontendProdImage
     rservImage=$rservProdImage
     wrImage=$wrProdImage
   elif [ $env = "dev" ]
   then
     backendImage=$backendDevImage
     builderImage=$builderDevImage
     dbImage=$dbDevImage
     dqdImage=$dqdDevImage
     frontendImage=$frontendDevImage
     rservImage=$rservDevImage
     wrImage=$wrDevImage
   elif [ $env = "test" ]
   then
     wrImage=$wrTestImage
   else
      echo Parameter [$env] is not supported.
      return -1
   fi
}
