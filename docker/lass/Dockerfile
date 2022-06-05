FROM node:10.16.0

# Default Environment
ARG NODE_ENV=production
ARG NODE_PORT=8080

# Install system dependecies
RUN apt-get update
RUN apt-get install -y mosquitto-clients
RUN npm install forever -g

# Create app directory
RUN mkdir -p /home/node/app && chown -R node:node /home/node/app

# Set working directory
WORKDIR /home/node/app

# Copy the dependency files
COPY ./lass/package*.json ./

# Set user
USER node

# Install dependencies
RUN npm install

# Copy the rest of the files
COPY --chown=node:node ./lass/ ./

# Expose the app port
EXPOSE $NODE_PORT

# Start the node server
CMD npm start
