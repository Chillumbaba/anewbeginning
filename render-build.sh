#!/usr/bin/env bash
set -o errexit
cd frontend
npm install --legacy-peer-deps
npm run build
cd ../backend
npm install
mkdir -p public
cp -r ../frontend/build/* public/ 