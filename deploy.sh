#!/bin/bash

set -e

# Variables
APP_DIR="/var/www/my-app"
REPO_URL="https://github.com/colton123e/supra-crud-app.git"
DOMAIN="your.domain.com"
EMAIL="your.email@email.com"

# Required Node.js and npm versions
REQUIRED_NODE_VERSION="22.13.0"
REQUIRED_NPM_VERSION="10.9.2"

# Function to install NVM and required Node.js version
install_nvm_and_node() {
  echo "Installing NVM..."
  curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.3/install.sh | bash

  # Load NVM into the current session
  export NVM_DIR="$HOME/.nvm"
  [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

  echo "Installing Node.js version $REQUIRED_NODE_VERSION..."
  nvm install $REQUIRED_NODE_VERSION
  nvm alias default $REQUIRED_NODE_VERSION
}

# Check if Node.js and npm are installed and at the correct versions
check_node_and_npm() {
  NODE_VERSION=$(node -v 2>/dev/null || echo "not_installed")
  NPM_VERSION=$(npm -v 2>/dev/null || echo "not_installed")

  if [[ "$NODE_VERSION" != "v$REQUIRED_NODE_VERSION" ]] || [[ "$NPM_VERSION" != "$REQUIRED_NPM_VERSION" ]]; then
    echo "Node.js or npm is not installed or not at the required versions."
    echo "Installing Node.js v$REQUIRED_NODE_VERSION and npm v$REQUIRED_NPM_VERSION using NVM..."
    install_nvm_and_node
  else
    echo "Node.js and npm are already installed and meet the required versions."
  fi
}

# Ensure Node.js and npm are correctly installed
if ! command -v node >/dev/null 2>&1 || ! command -v npm >/dev/null 2>&1; then
  echo "Node.js or npm is not installed. Installing them now..."
  install_nvm_and_node
else
  check_node_and_npm
fi

# Display Node.js and npm versions
echo "Using Node.js version: $(node -v)"
echo "Using npm version: $(npm -v)"

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

# Set up the backend
echo "Setting up the backend..."
cd $APP_DIR/server
npm install

# Install and build the client
echo "Setting up the frontend..."
cd $APP_DIR/client
npm install
npm run build

# Install PM2 to manage the backend
echo "Installing PM2 and starting the backend..."
sudo npm install -g pm2
pm2 start server.js --name my-app-backend --cwd $APP_DIR/server
pm2 startup
pm2 save

# Create Nginx configuration
echo "Configuring Nginx..."
NGINX_CONF="/etc/nginx/sites-available/my-app"
sudo bash -c "cat > $NGINX_CONF" <<EOL
server {
    listen 80;
    server_name $DOMAIN;

    root $APP_DIR/client/dist;
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
server {
    listen 443 ssl;
    listen [::]:443 ssl;

    root /var/www/my-app/client/dist;
    index index.html;

    # SSL certificates
    ssl_certificate /etc/letsencrypt/live/$DOMAIN/cert.pem;
    ssl_certificate_key /etc/letsencrypt/live/$DOMAIN/privkey.pem;

    # SSL settings
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_prefer_server_ciphers on;
    ssl_ciphers HIGH:!aNULL:!MD5;

    # Serve static files
    location / {
        try_files \$uri /index.html;
    }

    # Proxy API requests to the backend
    location /api/ {
        proxy_pass http://localhost:5000; # Adjust to your backend's address
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
    }

    # Error handling
    error_page 404 /index.html;
}
EOL

# Enable Nginx configuration
sudo ln -sf $NGINX_CONF /etc/nginx/sites-enabled/
sudo nginx -t
# Try to reload Nginx, start if it fails
echo "Reloading Nginx configuration..."
if ! sudo systemctl reload nginx; then
  echo "Nginx reload failed. Attempting to start Nginx..."
  sudo systemctl start nginx
  if [ $? -ne 0 ]; then
    echo "Failed to start Nginx. Please check the Nginx configuration and logs."
    exit 1
  else
    echo "Nginx started successfully."
  fi
else
  echo "Nginx reloaded successfully."
fi

# Obtain and configure SSL with Certbot
echo "Obtaining SSL certificate with Certbot..."
sudo certbot --nginx -d $DOMAIN -d $DOMAIN --non-interactive --agree-tos -m $EMAIL

# Test Certbot renewal
sudo certbot renew --dry-run

# Display completion message
echo "Deployment completed! Access your application at https://$DOMAIN"
