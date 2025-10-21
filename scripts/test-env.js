#!/usr/bin/env node
/**
 * Test environment variables are properly configured
 * Usage: node scripts/test-env.js [api|worker]
 */

const fs = require('fs');
const path = require('path');

const appType = process.argv[2] || 'api';
const envPath = path.join(__dirname, '..', 'apps', appType, '.env');

console.log(`\n🔍 Testing ${appType.toUpperCase()} environment configuration...\n`);

// Check if .env exists
if (!fs.existsSync(envPath)) {
  console.error(`❌ Error: .env file not found at ${envPath}`);
  console.log(`\n💡 Run: cp apps/${appType}/env.example.txt apps/${appType}/.env`);
  process.exit(1);
}

// Load .env file
require('dotenv').config({ path: envPath });

const required = {
  api: [
    'PORT',
    'NODE_ENV',
    'FIREBASE_PROJECT_ID',
    'GOOGLE_CLIENT_ID',
    'GOOGLE_CLIENT_SECRET',
    'GOOGLE_REDIRECT_URI',
    'OPENAI_API_KEY',
    'REDIS_HOST',
    'REDIS_PORT',
  ],
  worker: [
    'NODE_ENV',
    'FIREBASE_PROJECT_ID',
    'OPENAI_API_KEY',
    'REDIS_HOST',
    'REDIS_PORT',
  ],
};

const optional = {
  api: ['FIREBASE_CLIENT_EMAIL', 'FIREBASE_PRIVATE_KEY', 'SESSION_SECRET', 'REDIS_PASSWORD'],
  worker: ['FIREBASE_CLIENT_EMAIL', 'FIREBASE_PRIVATE_KEY', 'REDIS_PASSWORD'],
};

let hasErrors = false;
let hasWarnings = false;

// Check required variables
console.log('Required variables:');
required[appType].forEach(key => {
  const value = process.env[key];
  if (!value || value.includes('your-') || value.includes('change-me')) {
    console.log(`  ❌ ${key}: NOT SET or using placeholder`);
    hasErrors = true;
  } else {
    // Mask sensitive values
    const display = ['KEY', 'SECRET', 'PASSWORD'].some(s => key.includes(s))
      ? value.substring(0, 10) + '...'
      : value;
    console.log(`  ✅ ${key}: ${display}`);
  }
});

// Check optional variables
console.log('\nOptional variables:');
optional[appType].forEach(key => {
  const value = process.env[key];
  if (!value) {
    console.log(`  ⚠️  ${key}: Not set (will use defaults/GCP credentials)`);
    hasWarnings = true;
  } else if (value.includes('your-') || value.includes('change-me')) {
    console.log(`  ⚠️  ${key}: Using placeholder value`);
    hasWarnings = true;
  } else {
    const display = ['KEY', 'SECRET', 'PASSWORD'].some(s => key.includes(s))
      ? value.substring(0, 10) + '...'
      : value;
    console.log(`  ✅ ${key}: ${display}`);
  }
});

// Specific checks
console.log('\nValidation:');

// Check private key format
if (process.env.FIREBASE_PRIVATE_KEY) {
  const key = process.env.FIREBASE_PRIVATE_KEY;
  if (key.startsWith('"-----BEGIN PRIVATE KEY-----') && key.includes('\\n')) {
    console.log('  ✅ FIREBASE_PRIVATE_KEY: Properly formatted');
  } else {
    console.log('  ❌ FIREBASE_PRIVATE_KEY: Incorrect format (needs quotes and \\n)');
    hasErrors = true;
  }
}

// Check OpenAI key format
if (process.env.OPENAI_API_KEY) {
  const key = process.env.OPENAI_API_KEY;
  if (key.startsWith('sk-') || key.startsWith('sk-proj-')) {
    console.log('  ✅ OPENAI_API_KEY: Valid format');
  } else {
    console.log('  ❌ OPENAI_API_KEY: Invalid format (should start with sk- or sk-proj-)');
    hasErrors = true;
  }
}

// Check Google OAuth format
if (appType === 'api' && process.env.GOOGLE_CLIENT_ID) {
  const id = process.env.GOOGLE_CLIENT_ID;
  if (id.endsWith('.apps.googleusercontent.com')) {
    console.log('  ✅ GOOGLE_CLIENT_ID: Valid format');
  } else {
    console.log('  ❌ GOOGLE_CLIENT_ID: Invalid format (should end with .apps.googleusercontent.com)');
    hasErrors = true;
  }
}

// Summary
console.log('\n' + '='.repeat(50));
if (hasErrors) {
  console.log('❌ Configuration has ERRORS - fix them before running');
  console.log('\n📖 See FIREBASE_SETUP.md for detailed setup instructions');
  process.exit(1);
} else if (hasWarnings) {
  console.log('⚠️  Configuration has warnings - review optional settings');
  console.log('✅ All required variables are set correctly');
  process.exit(0);
} else {
  console.log('✅ All configuration looks good!');
  console.log('\n🚀 Ready to run: npm run dev');
  process.exit(0);
}

