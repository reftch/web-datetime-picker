ARG TAG=14-alpine
ARG FROM=node

FROM $FROM:$TAG

# set development proxy 
ENV PROXY=$PROXY

WORKDIR /app
USER root

# Install packages
RUN set -eux; \
    # Clean out directories that don't need to be part of the image
    rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/* \
    && \
    npm install -g pnpm

ENTRYPOINT ["/bin/sh"]
