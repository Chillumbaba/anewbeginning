#!/bin/sh
# exit on error
set -e

echo "Building client..."
cd client
npm install
CI=false npm run build

echo "Setting up server..."
cd ..
rm -rf server/public
mkdir -p server/public
cp -r client/build/* server/public/

echo "Building server..."
cd server
npm install
npm run build

echo "Build completed successfully!" 