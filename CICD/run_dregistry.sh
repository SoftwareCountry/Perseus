docker run --name registry \
	--restart=always \
	-v /data/auth:/auth \
	-e "REGISTRY_AUTH=htpasswd" \
	-e "REGISTRY_AUTH_HTPASSWD_REALM=Registry Realm" \
	-e REGISTRY_AUTH_HTPASSWD_PATH=/auth/htpasswd \
	-e REGISTRY_STORAGE_DELETE_ENABLED=true \
	-v /data/registry:/var/lib/registry \
	-v /certs:/certs \
	-e REGISTRY_HTTP_ADDR=0.0.0.0:443 \
	-e REGISTRY_HTTP_TLS_CERTIFICATE=/certs/arcadialab.ru.crt \
	-e REGISTRY_HTTP_TLS_KEY=/certs/arcadialab.ru.key \
	-d -p 443:443 \
	registry:2
