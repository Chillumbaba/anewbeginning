#!/bin/sh
# exit on error
set -e

# Install dependencies and build client
echo "Building client..."
cd client
npm install --production=false
CI=false npm run build

# Create server/public directory and copy client build
echo "Setting up server/public directory..."
cd ..
mkdir -p server/public
cp -r client/build/* server/public/

# Install dependencies and build server
echo "Building server..."
cd server
npm install --production=false
npm run build

echo "Build completed successfully!" 