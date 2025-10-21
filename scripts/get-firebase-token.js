#!/usr/bin/env node

/**
 * Helper script to get Firebase token for testing
 * 
 * This script provides instructions and helper functions to get a Firebase token
 * and test the meetings endpoint
 */

const https = require('https');
const http = require('http');
const readline = require('readline');

const API_BASE = 'http://localhost:3001';

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(color, message) {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const isHttps = url.startsWith('https://');
    const client = isHttps ? https : http;
    
    const requestOptions = {
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    };

    const req = client.request(url, requestOptions, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: parsed
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: data
          });
        }
      });
    });

    req.on('error', reject);
    
    if (options.body) {
      req.write(JSON.stringify(options.body));
    }
    
    req.end();
  });
}

function createInterface() {
  return readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
}

async function testWithToken(token) {
  log('cyan', '\n🧪 Testing with Firebase Token...');
  
  try {
    // Test auth endpoint
    const authResponse = await makeRequest(`${API_BASE}/auth/firebase`, {
      method: 'POST',
      body: { idToken: token }
    });
    
    if (authResponse.status === 200) {
      log('green', '✅ Firebase token is valid');
      log('blue', `   User ID: ${authResponse.data.uid}`);
      log('blue', `   Email: ${authResponse.data.user.email}`);
      
      // Test /auth/me endpoint
      const meResponse = await makeRequest(`${API_BASE}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (meResponse.status === 200) {
        log('green', '✅ Authentication middleware working');
      } else {
        log('yellow', '⚠️  Auth middleware issue:', meResponse.data);
      }
      
      return true;
    } else {
      log('red', '❌ Invalid Firebase token');
      console.log(authResponse.data);
      return false;
    }
  } catch (error) {
    log('red', '❌ Error testing token:', error.message);
    return false;
  }
}

async function testGoogleConnect(token) {
  log('cyan', '\n🔗 Testing Google Connect...');
  
  try {
    const response = await makeRequest(`${API_BASE}/google/connect`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` }
    });
    
    if (response.status === 200) {
      log('green', '✅ Google connect endpoint working');
      log('blue', `   Auth URL: ${response.data.authUrl}`);
      log('yellow', '\n   📋 Next steps:');
      log('reset', '   1. Open the auth URL in your browser');
      log('reset', '   2. Authorize the app to access your Google Calendar');
      log('reset', '   3. You\'ll be redirected to the callback URL');
      log('reset', '   4. Then you can fetch meetings!');
      return response.data.authUrl;
    } else {
      log('red', '❌ Google connect failed');
      console.log(response.data);
      return null;
    }
  } catch (error) {
    log('red', '❌ Error testing Google connect:', error.message);
    return null;
  }
}

async function testMeetings(token) {
  log('cyan', '\n📅 Testing Meetings Endpoint...');
  
  try {
    const from = '2024-10-16';
    const to = '2024-10-17';
    
    const response = await makeRequest(`${API_BASE}/meetings?from=${from}&to=${to}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    if (response.status === 200) {
      log('green', '✅ Meetings endpoint working!');
      log('blue', `   Found ${response.data.meetings.length} meetings`);
      log('blue', `   Cached: ${response.data.cached}`);
      log('blue', `   Cached at: ${response.data.cachedAt}`);
      
      if (response.data.meetings.length > 0) {
        log('yellow', '\n   📋 Sample meeting:');
        const meeting = response.data.meetings[0];
        log('reset', `   - ${meeting.summary || 'No title'}`);
        log('reset', `   - ${meeting.startTime} to ${meeting.endTime}`);
        if (meeting.attendees && meeting.attendees.length > 0) {
          log('reset', `   - ${meeting.attendees.length} attendees`);
        }
      }
      
      return true;
    } else if (response.status === 403) {
      log('yellow', '⚠️  Google account not connected yet');
      log('reset', '   You need to connect your Google account first');
      return false;
    } else {
      log('red', '❌ Meetings endpoint failed');
      console.log(response.data);
      return false;
    }
  } catch (error) {
    log('red', '❌ Error testing meetings:', error.message);
    return false;
  }
}

async function getTokenFromUser() {
  const rl = createInterface();
  
  return new Promise((resolve) => {
    log('magenta', '\n🔑 How to get a Firebase Token:');
    log('bright', '\n1. Open your frontend: http://localhost:3000');
    log('reset', '2. Sign in with Google (if not already signed in)');
    log('reset', '3. Open browser dev tools (F12)');
    log('reset', '4. Go to Console tab');
    log('reset', '5. Run this command:');
    log('yellow', '   firebase.auth().currentUser.getIdToken().then(token => console.log(token))');
    log('reset', '6. Copy the token');
    log('bright', '\nAlternatively, you can paste a token you already have.\n');
    
    rl.question('Enter your Firebase token (or press Enter to skip): ', (token) => {
      rl.close();
      resolve(token.trim());
    });
  });
}

async function main() {
  log('bright', '🔑 Firebase Token Tester');
  log('bright', '========================\n');
  
  const token = await getTokenFromUser();
  
  if (!token) {
    log('yellow', 'No token provided. Exiting...');
    return;
  }
  
  const isValid = await testWithToken(token);
  
  if (!isValid) {
    log('red', '\n❌ Token validation failed. Please check your token.');
    return;
  }
  
  // Test Google connect
  const authUrl = await testGoogleConnect(token);
  
  // Test meetings (might fail if Google not connected)
  await testMeetings(token);
  
  if (authUrl) {
    log('magenta', '\n🚀 Ready to test!');
    log('bright', '\nQuick test commands:');
    log('reset', `# Test meetings:`);
    log('yellow', `curl -H "Authorization: Bearer ${token}" "http://localhost:3001/meetings?from=2024-10-16&to=2024-10-17"`);
    log('reset', `# Connect Google:`);
    log('yellow', `curl -X POST -H "Authorization: Bearer ${token}" http://localhost:3001/google/connect`);
  }
}

// Run the script
main().catch(console.error);
