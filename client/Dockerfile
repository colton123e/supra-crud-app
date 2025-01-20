# Stage 1: Build Vite Client
FROM node:22.13.0 AS build-client

# Set the working directory for the build process
WORKDIR /app

# Copy package.json and package-lock.json for dependency installation
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy all files to the container
COPY . .

# Run the Vite build process
RUN npm run build

# Stage 2: Use Nginx to serve the React app
FROM nginx:alpine

# Copy the built React app into the Nginx HTML directory
COPY --from=build-client /app/dist /usr/share/nginx/html

# Replace the default Nginx configuration
COPY ./nginx.conf /etc/nginx/conf.d/default.conf

# Expose port for HTTP
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
