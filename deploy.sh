#!/bin/bash

set -e

# Variables
APP_DIR="/var/www/my-app"
REPO_URL="https://github.com/colton123e/supra-crud-app.git"
DOMAIN="your.domain.com"
EMAIL="your.email@email.com"

install_node() {
  # Install required software
  

  # Array of known package managers
  PACKAGE_MANAGERS=("apt" "apt-get" "dnf" "yum" "pacman" "brew")

  for pm in "${PACKAGE_MANAGERS[@]}"; do
      echo "Using '$pm' to install required packages (Node.js, npm, Git, Nginx, Certbot)..."

      case $pm in
        apt|apt-get)
          # Update package list and install Node.js + npm
          sudo $pm update -y && sudo $pm install -y nodejs npm git nginx certbot python3-certbot-nginx
          ;;
        dnf|yum)
          sudo $pm install -y nodejs npm git nginx certbot python3-certbot-nginx
          ;;
        pacman)
          sudo $pm -Sy --noconfirm nodejs npm git nginx certbot python3-certbot-nginx
          ;;
        brew)
          brew update && brew install node npm git nginx certbot python3-certbot-nginx
          ;;
        *)
          echo "Unsupported or unrecognized package manager: $pm"
          ;;
      esac
      # After attempting install, break from loop
      break
  done

  # Re-check if node was successfully installed
  if ! command -v node >/dev/null 2>&1; then
    echo "Failed to install Node.js with known package managers."
    echo "Please install Node.js and npm manually, then re-run this script."
    exit 1
  else
    echo "Node.js installed successfully!"
  fi
}

# 1. Check if Node.js is installed
if ! command -v node >/dev/null 2>&1; then
  install_node
else
  echo "Node.js is already installed."
fi

# 2. Check if npm is installed
if ! command -v npm >/dev/null 2>&1; then
  echo "npm not found. Attempting to install with the same approach..."
  install_node
else
  echo "npm is already installed."
fi

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
    server_name $DOMAIN;

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
server {
    listen 443 ssl;
    listen [::]:443 ssl;
    server_name your-domain.com;

    root /var/www/my-app/client/build;
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

# Install PM2 to manage the backend
echo "Installing PM2 and starting the backend..."
sudo npm install -g pm2
pm2 start server.js --name my-app-backend --cwd $APP_DIR/server
pm2 startup
pm2 save

# Display completion message
echo "Deployment completed! Access your application at https://$DOMAIN"
