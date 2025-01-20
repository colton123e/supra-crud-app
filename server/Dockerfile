# Use Node.js base image
FROM node:22.13.0

# Set working directory
WORKDIR /src/server

# Copy server package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy the server files
COPY . .

# Expose the port the server listens on
EXPOSE 5000

# Start the server
CMD ["npm", "start"]
