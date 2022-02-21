
FROM=node
TAG?=16-alpine

PROD_NAME=web-datetime-picker
VERSION=0.1.0
APP_NAME=dev-${PROD_NAME}-${VERSION}
DOCKER?=docker
PROXY?=http://cp2123:8080
PORT?=3000

APP_DIR?=app
OSTYPE := $(shell uname -s | tr '[:upper:]' '[:lower:]')
ARCHTYPE := $(shell uname -m | tr '[:upper:]' '[:lower:]')
ATTACH_ENV?=-a=stdin -a=stdout -a=stderr
SECURITY_ENV?=--security-opt label=disable
VOLUME_ENV=-v "${CURDIR}":/app
PROXY_ENV=-e PROXY="${PROXY}"
PORT_ENV=-p ${PORT}:3000
YEAR=$(shell date +"%Y")
BUILD_DATE=$(shell date --iso=seconds)

HAS_DOCKER ?= $(shell command -v docker > /dev/null 2>&1; [ $$? -eq 0 ] && echo 1 || echo 0)
HAS_PODMAN ?= $(shell command -v podman > /dev/null 2>&1; [ $$? -eq 0 ] && echo 1 || echo 0)

ifeq ($(DOCKER), )
	ifeq ($(HAS_DOCKER), 1)
		DOCKER=docker
	endif
	ifeq ($(HAS_PODMAN), 1)
		DOCKER=podman
	endif
endif

ifeq ($(OSTYPE), darwin)
	ATTACH=
endif

DOCKERRUN=${DOCKER} container run \
	--name ${APP_NAME} \
	--rm \
	-t \
	${PORT_ENV} \
	${PROXY_ENV} \
	${ATTACH_ENV} \
	${SECURITY_ENV} \
	${VOLUME_ENV} \
	${APP_NAME}:${TAG}

DOCKERBUILD=${DOCKER} build \
	--build-arg FROM=${FROM} \
	--build-arg TAG=${TAG} \
	--build-arg PORT=${PORT} \
	--build-arg PROXY=${PROXY} \
	--build-arg NAME=${APP_NAME} \
	--build-arg YEAR=${YEAR} \
	--build-arg BUILD_DATE=${BUILD_DATE} \
	--build-arg VERSION=${VERSION} 

.PHONY: clean init app prod prod-run

docker:
ifeq ($(DOCKER), )
	$(error No docker/podman command, cannot continue)
endif

init: docker
	${DOCKERBUILD} -f .config/docker-config/npm.dockerfile . -t ${APP_NAME}:${TAG}
	${DOCKERRUN} .config/docker-config/install.sh

dev: docker
	${DOCKERRUN} -c "cd /app/${APP_DIR} && pnpm dev"

build: docker
	${DOCKERRUN} .config/docker-config/build.sh

preview: docker
	${DOCKERRUN} -c "cd /app/${APP_DIR} && pnpm preview"

test: docker
	${DOCKERRUN} -c "cd /app/${APP_DIR} && pnpm test"

lint: docker
	${DOCKERRUN} -c "cd /app/${APP_DIR} && pnpm lint"

docs: docker
	${DOCKERRUN} -c "cd /app/${DOC_DIR} && pnpm $(filter-out $@,$(MAKECMDGOALS))"

npm: docker
	${DOCKERRUN} -c "cd /app/${APP_DIR} && pnpm $(filter-out $@,$(MAKECMDGOALS))"

dev-stop: docker
	${DOCKER} container stop ${APP_NAME}

prod-build: docker
	${DOCKERRUN} .config/docker-config/build.sh
	${DOCKERBUILD} -f .config/docker-config/prod.dockerfile . -t ${PROD_NAME}:${VERSION}

prod-run: docker
	${DOCKER} container run \
	  --name ${PROD_NAME} -d -t \
    ${PORT_ENV} \
		${PROD_NAME}:${VERSION}

prod-start: docker
	${DOCKER} container start ${PROD_NAME}

prod-stop: docker
	${DOCKER} container stop -t 2 ${PROD_NAME}

prod-remove: docker
	${DOCKER} container rm ${PROD_NAME}

prod-logs: docker
	${DOCKER} container logs -f ${PROD_NAME}

dev-sh: docker                                                                                                                                                                                                                                                                            
	${DOCKER} exec -it ${APP_NAME} /bin/sh

prod-sh: docker                                                                                                                                                                                                                                                                            
	${DOCKER} exec -it ${PROD_NAME} /bin/sh

clean: docker
	rm -rf .pnpm-store
	rm -f package-lock.json
	rm -rf target
	rm -rf node_modules
	rm -rf ${APP_DIR}/node_modules
	rm -rf ${APP_DIR}/dist
	rm -f ${APP_DIR}/pnpm-lock.yaml
	rm -f ${APP_DIR}/package-lock.json
	rm -rf ${APP_DIR}/types
	rm -rf ${DOC_DIR}/node_modules
	rm -rf ${DOC_DIR}/docs/.vitepress/dist
	rm -f ${DOC_DIR}/pnpm-lock.yaml
	rm -f ${DOC_DIR}/package-lock.json
	rm -rf ${SSR_DIR}/node_modules
	rm -rf ${SSR_DIR}/dist
	rm -f ${SSR_DIR}/pnpm-lock.yaml
	rm -f ${SSR_DIR}/package-lock.json
ifneq ($(shell ${DOCKER} images -q ${APP_NAME}:${TAG} 2> /dev/null), )
	${DOCKER} rmi ${APP_NAME}:${TAG}
endif
ifneq ($(shell ${DOCKER} images -q ${PROD_NAME}:${TAG} 2> /dev/null), )
	${DOCKER} rmi ${PROD_NAME}:${TAG}
endif

%:
	@:
