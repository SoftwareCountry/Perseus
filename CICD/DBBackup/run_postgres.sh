#!/bin/bash

# docker exec -it mssqlTest /opt/mssql-tools/bin/sqlcmd -S localhost -U sa
# psql -h localhost -p 5431 -d cdm_souffleur -U postgres --password
# docker exec -it mysqlTest mysql -u root -p

set -e
set -x

postgresImage=postgres
postgresDb=postgresBackupTest

dbPass="vasjDHnv45#"

# Run
docker run \
   -v ~/DBBackup:/var/DBBackup \
   --name $postgresDb -e POSTGRES_DB=cdm_souffleur -e POSTGRES_PASSWORD=$dbPass \
   -p 5433:5432 -d \
   --restart unless-stopped $postgresImage
