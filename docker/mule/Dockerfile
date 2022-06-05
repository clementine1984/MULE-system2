FROM node:12

# Default Environment
ARG NODE_ENV=production
ARG NODE_PORT=8080

# Set environment variables
ENV NODE_ENV $NODE_ENV

# Install system dependencies
RUN npm install -g nodemon

# Create app directory
RUN mkdir -p /home/node/app && chown -R node:node /home/node/app

# Set working directory
WORKDIR /home/node/app

# Set user
USER node

# Copy the dependency files and install the main dependencies
COPY ./mule/package*.json ./
RUN npm install

# Copy packages, install their dependencies, and build them
COPY --chown=node:node ./mule/src/packages ./src/packages
RUN for dir in src/packages/*; do (cd "$dir" && npm install && npm run build); done

# Copy the rest of the files
COPY --chown=node:node ./mule/ ./

# Discover packages
RUN npm run package:discover

# Build OS.js
RUN npm run client-build

# Expose the app port
EXPOSE $NODE_PORT

# Start the node server
CMD npm run prod
