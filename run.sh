#!/bin/bash

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

echo "Running npm install commands and starting the server..."
cd client
npm install
npm run build

cd ../server
npm install

# Configure the hostname, start the server, and store its PID
# ENV File paths
ENV_FILE="./.env"
PORT=5000

# Check if running in WSL
if grep -qi "microsoft" /proc/version; then
  echo "Running inside WSL. Setting hostname to localhost in .env file..."
  HOSTNAME="localhost"
else
  echo "Not running in WSL. Using machine hostname..."
  HOSTNAME=$(hostname)
fi

# Ensure .env file exists
if [ ! -f "$ENV_FILE" ]; then
  echo ".env file not found. Creating a new one..."
  touch "$ENV_FILE"
fi

# Update or add API_BASE_URL in the .env file
if grep -q "^API_BASE_URL=" "$ENV_FILE"; then
  sed -i "s|^API_BASE_URL=.*|API_BASE_URL=http://$HOSTNAME:$PORT|" "$ENV_FILE"
  echo "Updated API_BASE_URL to http://$HOSTNAME:$PORT in .env file."
else
  echo "API_BASE_URL=http://$HOSTNAME:$PORT" >> "$ENV_FILE"
  echo "Added API_BASE_URL=http://$HOSTNAME:$PORT to .env file."
fi

echo
echo "Starting the server..."
node server.js &
SERVER_PID=$!
echo "Server running with PID: $SERVER_PID"

# Pause for 15 seconds to let the backend start
echo
echo "Wait 15 seconds for the backend to start"
echo
sleep 15

# Navigate back to the client directory and start the client
cd ../client
echo "Starting the client..."
npm run dev &
CLIENT_PID=$!
echo "Client running with PID: $CLIENT_PID"

# Pause for 10 seconds to ensure the echo messages appear last
sleep 10

# Display the commands to stop the processes
echo
echo "To stop the processes, use the following commands:"
echo "Kill server process: kill $SERVER_PID"
echo "Kill client process: kill $CLIENT_PID"
