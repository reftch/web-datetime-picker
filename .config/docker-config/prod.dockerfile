ARG TAG=14-apline
ARG PORT=3000
ARG FROM=node

FROM $FROM:$TAG

ARG NPM_REGISTRY=https://nexus03.compart.com/repository/npm-group/
ARG NPM_PACKAGE=undefined
ARG NAME=UNDEFINED
ARG BUILD_DATE=UNDEFINED
ARG YEAR=2022
ARG VERSION=UNDEFINED
LABEL name=${NAME} \
      maintainer="support@compart.com" \
      vendor="Compart AG" \
      version=${VERSION} \
      summary="DocBridgePilot User Interface" \
      description="A flexible and powerful UI application for managing DcoBridgePilot" \
      com.compart.product="DocBridgePilot UI" \
      com.compart.version=${VERSION} \
      com.compart.license="All rights reserved. Copyright Compart AG ${YEAR}" \
      com.compart.builddate=${BUILD_DATE}

ENV PROXY=$PROXY

WORKDIR /app
USER root

# Clean out directories that don't need to be part of the image                                                                                                                                                                                                                     
RUN rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

COPY ./server/dist/ ./
COPY ./app/dist/ui/ ./public
COPY ./press/docs/.vitepress/dist/ ./public/docs

EXPOSE 3000

CMD [ "server.js" ]
