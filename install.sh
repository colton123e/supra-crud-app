#!/bin/bash

set -e

# Variables
APP_DIR="/var/www/my-app"
REPO_URL="https://github.com/colton123e/supra-crud-app.git"
DOMAIN="app.cehomenet.pro"
EMAIL="homenet_manager@cehomenet.pro"

# Update the system
echo "Updating system packages..."
sudo apt update && sudo apt upgrade -y

# Install required software
echo "Installing required packages (Node.js, npm, Git, Nginx, Certbot)..."
sudo apt install -y nodejs npm git nginx certbot python3-certbot-nginx

# Clone the repository
if [ ! -d "$APP_DIR" ]; then
  echo "Cloning repository..."
  sudo git clone "$REPO_URL" "$APP_DIR"
else
  echo "Repository already exists. Pulling latest changes..."
  cd "$APP_DIR"
  sudo git pull
fi

# Navigate to the app directory
cd "$APP_DIR"

# Install and build the client
echo "Setting up the frontend..."
cd client
npm install
npm run build

# Set up the backend
echo "Setting up the backend..."
cd ../server
npm install

# Create Nginx configuration
echo "Configuring Nginx..."
NGINX_CONF="/etc/nginx/sites-available/my-app"
sudo bash -c "cat > $NGINX_CONF" <<EOL
server {
    listen 80;
    server_name $DOMAIN www.$DOMAIN;

    root $APP_DIR/client/build;
    index index.html;

    location / {
        try_files \$uri /index.html;
    }

    location /api/ {
        proxy_pass http://localhost:5000; # Backend API
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
    }

    error_page 404 /index.html;
}
EOL

# Enable Nginx configuration
sudo ln -sf $NGINX_CONF /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx

# Obtain and configure SSL with Certbot
echo "Obtaining SSL certificate with Certbot..."
sudo certbot --nginx -d $DOMAIN -d $DOMAIN --non-interactive --agree-tos -m $EMAIL

# Test Certbot renewal
sudo certbot renew --dry-run

# Install PM2 to manage the backend
echo "Installing PM2 and starting the backend..."
sudo npm install -g pm2
pm2 start server.js --name my-app-backend --cwd $APP_DIR/server
pm2 startup
pm2 save

# Display completion message
echo "Deployment completed! Access your application at https://$DOMAIN"
