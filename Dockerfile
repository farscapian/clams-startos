FROM node:latest as build-stage

RUN mkdir /app
# COPY the clams-remote into the container for build.
ADD clams-remote /app
WORKDIR /app

# build the project.
RUN yarn 
RUN yarn build

FROM nginx:1.25.4
RUN rm -rf /usr/share/nginx/html/*
COPY --from=build-stage /app/build /usr/share/nginx/html

EXPOSE 80

ADD ./nginx.conf /etc/nginx/nginx.conf

ADD ./docker_entrypoint.sh /usr/local/bin/docker_entrypoint.sh
RUN chmod a+x /usr/local/bin/docker_entrypoint.sh
ENTRYPOINT [ "docker_entrypoint.sh" ]