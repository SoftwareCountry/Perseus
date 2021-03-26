#!/bin/bash
pool=$1
agentid="1"
agentName="azure-agent-${agentid}-${pool}"
docker rm -f $agentName

docker run \
  --net=host \
  --restart=always \
  -d \
  -P \
  --name $agentName \
  -e AZP_URL="https://dev.azure.com/Arcadia-Internal-CDM" \
  -e AZP_TOKEN="" \
  -e AZP_AGENT_NAME="$(hostname)-agent-${agentid}-${pool}" \
  -e AZP_POOL="${pool}" \
  -e AZP_WORK='/var/vsts/$AZP_AGENT_NAME' \
  -v /var/vsts:/var/vsts:delegated \
  -v /var/run/docker.sock:/var/run/docker.sock \
  azureagent:latest 
