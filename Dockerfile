FROM node:6-alpine
MAINTAINER LeanKit

ENV APP_PATH /app

# Install dependencies and app
WORKDIR $APP_PATH
COPY . .
RUN .docker/build.sh && rm -rf .docker

# Default port
EXPOSE 8000

# Entrypoint script to set env vars when linking containers for dev
# Runs tini to handle zombie process reaping and pass signals to Node correctly
COPY .docker /
ENTRYPOINT [ "/sbin/tini", "--", "/usr/local/bin/entry.sh" ]
CMD [ "node", "./lib/index.js" ]
