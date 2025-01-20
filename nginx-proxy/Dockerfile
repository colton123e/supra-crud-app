# Use the official Nginx image as the base
FROM nginx:alpine

# Copy the custom Nginx configuration
COPY ./nginx.conf /etc/nginx/conf.d/default.conf

# Copy SSL certificates
COPY ./ssl /etc/nginx/ssl

# Expose HTTP and HTTPS ports
EXPOSE 80 443
