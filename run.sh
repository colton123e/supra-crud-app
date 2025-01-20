#!/bin/bash
# Function to detect a compatible package manager and install Node.js
install_node() {
  echo "Node.js not found. Attempting to install..."

  # Array of known package managers
  PACKAGE_MANAGERS=("apt" "apt-get" "dnf" "yum" "pacman" "brew")

  for pm in "${PACKAGE_MANAGERS[@]}"; do
    if command -v $pm >/dev/null 2>&1; then
      echo "Using '$pm' to install Node.js..."

      case $pm in
        apt-get|apt)
          # Update package list and install Node.js + npm
          sudo $pm update -y && sudo $pm install -y nodejs npm
          ;;
        dnf|yum)
          sudo $pm install -y nodejs npm
          ;;
        pacman)
          sudo $pm -Sy --noconfirm nodejs npm
          ;;
        brew)
          brew update && brew install node
          ;;
        *)
          echo "Unsupported or unrecognized package manager: $pm"
          ;;
      esac

      # After attempting install, break from loop
      break
    fi
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


echo "Runnning the npm intall commands and starting the server."
cd client
npm install

cd ../server
npm install

# Start the server and store its PID
echo "Starting the server..."
node server.js &
SERVER_PID=$!
echo "Server running with PID: $SERVER_PID"

# Pause for 10 seconds to let the backend start
echo
echo "Wait 10 seconds for the backend to start"
echo
sleep 10


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
