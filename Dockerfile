FROM node:latest as build-stage
ADD clams-remote /app
WORKDIR /app
RUN yarn
RUN yarn build


FROM node:alpine
RUN apk update
RUN apk add --no-cache tini && \
    rm -f /var/cache/apk/*
    
WORKDIR /app
COPY --from=build-stage /app/build ./build
COPY clams-remote/package.json clams-remote/yarn.lock ./
RUN yarn install --production
RUN rm -rf /usr/local/share/.cache
ADD ./docker_entrypoint.sh /usr/local/bin/docker_entrypoint.sh
RUN chmod a+x /usr/local/bin/docker_entrypoint.sh
ENTRYPOINT [ "docker_entrypoint.sh" ]









############ WORKING

#FROM node:latest

# RUN mkdir /output
# VOLUME /output
# RUN mkdir /app

# # COPY the clams-remote into the container for build.
# ADD clams-remote /app

# WORKDIR /app
# # build the project.
# #RUN yarn build
# EXPOSE 5173
# ENV HOST=0.0.0.0
# ENV PORT 5173

# # install dependencies
# RUN yarn

# ENTRYPOINT [ "yarn", "dev", "--host", "0.0.0.0" ]