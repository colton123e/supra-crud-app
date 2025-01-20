#!/bin/bash
echo "This will run the npm intall commands and start the server."
cd client
npm install

cd ../server
npm install
node server.js &



cd ../client
npm run dev &
