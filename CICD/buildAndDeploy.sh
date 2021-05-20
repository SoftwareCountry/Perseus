!#/bin/bash

component=$1
env=$2
deploy=$3

echo "Build of [$component] started for the [$env] environment. Deploy=[$deploy]".

set -e
/azp/pullSources.sh ~/source
/azp/build.sh $component $env

echo deploy=$deploy
if [ $deploy = "yes" ] || [ $deploy = "YES" ]
then
  /azp/ssh_deploy.sh $component $env
else
  echo Deploy skipped due to pipeline settings.
fi
