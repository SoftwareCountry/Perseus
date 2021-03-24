#!/bin/bash

echo "Cleanup images and volumes..."
docker image prune -a -f || true
docker volume prune -f || true

