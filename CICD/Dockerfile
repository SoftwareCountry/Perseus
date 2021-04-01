FROM ubuntu:18.04

# To make it easier for build and release pipelines to run apt-get,
# configure apt to not require confirmation (assume the -y argument by default)
ENV DEBIAN_FRONTEND=noninteractive
RUN echo "APT::Get::Assume-Yes \"true\";" > /etc/apt/apt.conf.d/90assumeyes

RUN apt-get update \
&& apt-get install -y --no-install-recommends \
        ca-certificates \
        curl \
        jq \
        git \
        iputils-ping \
        libcurl4 \
        libicu60 \
        libunwind8 \
        netcat \
        libssl1.0 \
        docker \
        openssh-client

WORKDIR /azp

COPY ./start.sh .
RUN mkdir /root/.ssh
COPY id_rsa id_rsa.pub /root/.ssh/
COPY * ./

RUN chmod +x start.sh && chmod 600 ~/.ssh/id_rsa && \
    ssh-keyscan -H jnjcicdu1 >> ~/.ssh/known_hosts && \
    ssh-keyscan -H jnjdmdemou1 >> ~/.ssh/known_hosts
RUN curl -sSL https://get.docker.com/ | sh

CMD ["./start.sh"]
