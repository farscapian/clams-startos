FROM node:latest

RUN mkdir /clams-remote

# COPY the clams-app into the container for build.
ADD clams-remote /clams-remote

WORKDIR /app
# build the project.
#RUN yarn build
ENV HOST=0.0.0.0
ENV PORT 5173

# install dependencies
RUN yarn

#RUN chmod +x /usr/local/bin/clams-remote
ADD ./docker_entrypoint.sh /usr/local/bin/docker_entrypoint.sh
RUN chmod a+x /usr/local/bin/docker_entrypoint.sh

ENTRYPOINT [ docker_entrypoint.sh ]