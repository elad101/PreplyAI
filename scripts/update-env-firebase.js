#!/usr/bin/env node
/**
 * Automatically updates .env files with correctly formatted Firebase credentials
 * Usage: node scripts/update-env-firebase.js path/to/service-account.json
 */

const fs = require('fs');
const path = require('path');

const jsonPath = process.argv[2];

if (!jsonPath) {
  console.error('❌ Error: Please provide path to Firebase service account JSON file');
  console.log('\nUsage:');
  console.log('  node scripts/update-env-firebase.js path/to/service-account.json');
  console.log('\nExample:');
  console.log('  node scripts/update-env-firebase.js ~/Downloads/my-project-firebase-adminsdk.json');
  process.exit(1);
}

try {
  const fullPath = path.resolve(jsonPath);
  
  if (!fs.existsSync(fullPath)) {
    console.error(`❌ Error: File not found: ${fullPath}`);
    process.exit(1);
  }

  const serviceAccount = JSON.parse(fs.readFileSync(fullPath, 'utf-8'));

  if (!serviceAccount.project_id || !serviceAccount.private_key || !serviceAccount.client_email) {
    console.error('❌ Error: Invalid Firebase service account JSON file');
    console.error('   Missing required fields: project_id, private_key, or client_email');
    process.exit(1);
  }

  console.log('✅ Firebase service account JSON loaded successfully!\n');

  // Update apps/api/.env
  const apiEnvPath = path.join(__dirname, '../apps/api/.env');
  const workerEnvPath = path.join(__dirname, '../apps/worker/.env');

  function updateEnvFile(envPath, appName) {
    if (!fs.existsSync(envPath)) {
      console.log(`⚠️  ${appName} .env file not found, skipping...`);
      return;
    }

    let envContent = fs.readFileSync(envPath, 'utf-8');

    // Update or add Firebase credentials
    const updates = {
      FIREBASE_PROJECT_ID: serviceAccount.project_id,
      FIREBASE_CLIENT_EMAIL: serviceAccount.client_email,
      FIREBASE_PRIVATE_KEY: serviceAccount.private_key,
    };

    for (const [key, value] of Object.entries(updates)) {
      const regex = new RegExp(`^${key}=.*$`, 'm');
      const newLine = `${key}="${value}"`;
      
      if (regex.test(envContent)) {
        // Replace existing line
        envContent = envContent.replace(regex, newLine);
      } else {
        // Add new line
        envContent += `\n${newLine}`;
      }
    }

    fs.writeFileSync(envPath, envContent);
    console.log(`✅ Updated ${appName} .env file`);
  }

  updateEnvFile(apiEnvPath, 'API');
  updateEnvFile(workerEnvPath, 'Worker');

  console.log('\n🎉 Firebase credentials updated successfully!');
  console.log('\n💡 You can now run:');
  console.log('   cd apps/api && npm run dev');
  console.log('   cd apps/worker && npm run dev');

} catch (error) {
  console.error('❌ Error:', error.message);
  process.exit(1);
}

