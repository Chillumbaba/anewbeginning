#!/usr/bin/env bash
# exit on error
set -o errexit
set -o pipefail
set -o nounset

echo "Node version: $(node -v)"
echo "NPM version: $(npm -v)"

echo "Installing dependencies..."
npm ci || npm install

echo "Building client..."
cd client
npm ci || npm install
CI=false npm run build

echo "Setting up server..."
cd ..
rm -rf server/public
mkdir -p server/public
cp -r client/build/* server/public/

echo "Building server..."
cd server
npm ci || npm install
npm run build

echo "Build completed successfully!" 