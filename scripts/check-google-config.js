#!/usr/bin/env node

/**
 * Check Google OAuth configuration
 */

require('dotenv').config({ path: './apps/api/.env' });

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
};

function log(color, message) {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

log('bright', '🔧 Google OAuth Configuration Check');
log('bright', '==================================\n');

const required = [
  'GOOGLE_CLIENT_ID',
  'GOOGLE_CLIENT_SECRET', 
  'GOOGLE_REDIRECT_URI',
  'GOOGLE_CALENDAR_SCOPES'
];

let allGood = true;

required.forEach(key => {
  const value = process.env[key];
  if (value) {
    log('green', `✅ ${key}: ${value}`);
    
    if (key === 'GOOGLE_REDIRECT_URI') {
      if (value === 'http://localhost:3001/google/callback') {
        log('green', '   ✅ Correct redirect URI');
      } else {
        log('red', `   ❌ Should be: http://localhost:3001/google/callback`);
        allGood = false;
      }
    }
  } else {
    log('red', `❌ ${key}: Missing`);
    allGood = false;
  }
});

log('bright', '\n📋 Next Steps:');
if (allGood) {
  log('green', '✅ Configuration looks good!');
  log('reset', '1. Make sure Google Cloud Console has the same redirect URI');
  log('reset', '2. Test the connection in your frontend');
} else {
  log('red', '❌ Fix the missing/incorrect configuration above');
}
