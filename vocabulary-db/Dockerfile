FROM postgres

ARG BASE64_PAT
RUN apt-get update \
    && apt-get install -yqq --no-install-recommends ca-certificates git \
    && apt-get autoclean \
    && apt-get autoremove -y \
    && rm -rf /var/lib/apt/lists/* \
    && git -c http.extraHeader="Authorization: Basic $BASE64_PAT" clone https://dev.arcadia.spb.ru/Arcadia-CDM/Perseus/_git/vocabulary tmp/vocabulary

COPY init.sql /docker-entrypoint-initdb.d/

ENV POSTGRES_DB vocabulary
ENV POSTGRES_PASSWORD password
