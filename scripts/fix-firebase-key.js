#!/usr/bin/env node
/**
 * Helper script to format Firebase private key correctly for .env files
 * Usage: node scripts/fix-firebase-key.js path/to/service-account.json
 */

const fs = require('fs');
const path = require('path');

const jsonPath = process.argv[2];

if (!jsonPath) {
  console.error('❌ Error: Please provide path to Firebase service account JSON file');
  console.log('\nUsage:');
  console.log('  node scripts/fix-firebase-key.js path/to/service-account.json');
  console.log('\nExample:');
  console.log('  node scripts/fix-firebase-key.js ~/Downloads/my-project-firebase-adminsdk.json');
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
  console.log('📋 Copy these lines to your .env files (apps/api/.env and apps/worker/.env):\n');
  console.log('─'.repeat(80));
  console.log(`FIREBASE_PROJECT_ID=${serviceAccount.project_id}`);
  console.log(`FIREBASE_CLIENT_EMAIL=${serviceAccount.client_email}`);
  console.log(`FIREBASE_PRIVATE_KEY="${serviceAccount.private_key}"`);
  console.log('─'.repeat(80));
  console.log('\n⚠️  Important: Make sure to copy the ENTIRE FIREBASE_PRIVATE_KEY line (it\'s very long!)');
  console.log('💡 Tip: The private key should be on ONE line with \\n characters (not actual newlines)\n');

} catch (error) {
  console.error('❌ Error reading or parsing JSON file:', error.message);
  process.exit(1);
}

