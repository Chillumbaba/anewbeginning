#!/bin/bash
# Exit on error
set -e

echo "Installing dependencies and building client..."
cd client
npm install
npm run build

echo "Installing dependencies and building server..."
cd ../server
npm install
npm run build

echo "Setting up server/public directory..."
mkdir -p public
cp -r ../client/build/* public/

echo "Build completed!" 