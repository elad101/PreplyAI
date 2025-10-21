#!/usr/bin/env node

/**
 * Debug script for Google Calendar connection issues
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

async function getTokenFromUser() {
  const rl = createInterface();
  
  return new Promise((resolve) => {
    log('magenta', '\n🔑 Enter your Firebase token to debug Google Calendar connection:');
    log('yellow', '   Get it from: http://localhost:3000 → F12 → Console → getFirebaseToken()');
    
    rl.question('\nToken: ', (token) => {
      rl.close();
      resolve(token.trim());
    });
  });
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
      log('blue', `   Auth URL generated successfully`);
      
      // Check if the URL contains the right domain and client ID
      const authUrl = response.data.authUrl;
      if (authUrl.includes('accounts.google.com')) {
        log('green', '✅ Auth URL points to Google');
      } else {
        log('red', '❌ Auth URL does not point to Google');
      }
      
      if (authUrl.includes('412586936025-7p427jple7ihuoi2rcv88ati3goui40h')) {
        log('green', '✅ Auth URL contains correct client ID');
      } else {
        log('red', '❌ Auth URL missing or incorrect client ID');
      }
      
      return authUrl;
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

async function testMeetingsWithToken(token) {
  log('cyan', '\n📅 Testing Meetings Endpoint...');
  
  try {
    const from = '2024-10-16T00:00:00Z';
    const to = '2024-10-17T23:59:59Z';
    
    const response = await makeRequest(`${API_BASE}/meetings?from=${from}&to=${to}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    if (response.status === 200) {
      log('green', '✅ Meetings endpoint working!');
      log('blue', `   Found ${response.data.meetings.length} meetings`);
      log('blue', `   Cached: ${response.data.cached}`);
      return true;
    } else if (response.status === 403) {
      log('yellow', '⚠️  Google account not connected yet');
      log('reset', '   This is expected if you haven\'t completed the OAuth flow');
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

async function main() {
  log('bright', '🐛 Google Calendar Connection Debugger');
  log('bright', '=====================================\n');
  
  const token = await getTokenFromUser();
  
  if (!token) {
    log('red', 'No token provided. Exiting...');
    return;
  }
  
  // Test Google connect
  const authUrl = await testGoogleConnect(token);
  
  // Test meetings (should fail if not connected)
  const meetingsWorking = await testMeetingsWithToken(token);
  
  log('bright', '\n📊 Debug Summary');
  log('bright', '================');
  
  if (authUrl && !meetingsWorking) {
    log('yellow', '🎯 Issue identified: OAuth flow not completed');
    log('reset', '');
    log('bright', 'Next steps:');
    log('reset', '1. Open this URL in your browser:');
    log('blue', `   ${authUrl}`);
    log('reset', '2. Sign in with Google (thegenda@gmail.com)');
    log('reset', '3. Grant calendar access permissions');
    log('reset', '4. You\'ll be redirected to a callback URL');
    log('reset', '5. Test the meetings endpoint again');
  } else if (authUrl && meetingsWorking) {
    log('green', '🎉 Everything is working! Google Calendar is connected.');
  } else {
    log('red', '❌ There\'s an issue with the Google OAuth setup.');
    log('reset', '   Check your Google Cloud Console configuration.');
  }
}

// Run the debugger
main().catch(console.error);
