#!/bin/bash
echo "This will run the npm intall commands and start the server."
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