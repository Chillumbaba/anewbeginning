#!/usr/bin/env bash
# exit on error
set -o errexit

# Build frontend
cd client
npm install
npm run build

# Move frontend build to server's public directory
cd ..
rm -rf server/public
mkdir -p server/public
mv client/build/* server/public/

# Build backend
cd server
npm install
npm run build 