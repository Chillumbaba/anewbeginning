const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Helper function to execute commands
function exec(command) {
  console.log(`Executing: ${command}`);
  execSync(command, { stdio: 'inherit' });
}

// Ensure we're in the root directory
try {
  // Build client
  console.log('\n📦 Building client...');
  exec('cd client && npm install');
  exec('cd client && npm run build');

  // Build server
  console.log('\n📦 Building server...');
  exec('cd server && npm install');
  exec('cd server && npm run build');

  // Copy client build to server public
  console.log('\n📦 Copying client build to server...');
  const publicDir = path.join(__dirname, 'server', 'public');
  const clientBuildDir = path.join(__dirname, 'client', 'build');

  // Create public directory if it doesn't exist
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  // Copy build files
  fs.cpSync(clientBuildDir, publicDir, { recursive: true });

  console.log('\n✅ Build completed successfully!');
} catch (error) {
  console.error('\n❌ Build failed:', error);
  process.exit(1);
} 