pg_dump -U postgres -W -F t cdm_souffleur > /var/DBBackup/cdm_souffleur.tar

psql -U postgres -c "drop database cdm_souffleur"
pg_restore -d test1 -U postgres -C cdm_souffleur.tar
