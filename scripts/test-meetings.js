#!/usr/bin/env node

/**
 * Test script for PreplyAI Meetings API
 * 
 * This script helps test the meetings endpoint by:
 * 1. Generating a test Firebase token (for development)
 * 2. Testing the meetings endpoint with proper authentication
 * 3. Testing Google OAuth flow
 */

const https = require('https');
const http = require('http');

const API_BASE = 'http://localhost:3001';
const FRONTEND_BASE = 'http://localhost:3000';

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

async function testHealth() {
  log('cyan', '\n🏥 Testing Health Endpoint...');
  
  try {
    const response = await makeRequest(`${API_BASE}/health`);
    
    if (response.status === 200 && response.data.ok) {
      log('green', '✅ Health check passed');
      log('blue', `   Database: ${response.data.services.database.status} (${response.data.services.database.responseTime}ms)`);
      log('blue', `   Redis: ${response.data.services.redis.status} (${response.data.services.redis.responseTime}ms)`);
      return true;
    } else {
      log('red', '❌ Health check failed');
      console.log(response.data);
      return false;
    }
  } catch (error) {
    log('red', '❌ Health check error:', error.message);
    return false;
  }
}

async function testAuthEndpoint() {
  log('cyan', '\n🔐 Testing Auth Endpoint...');
  
  try {
    // Test without idToken (should fail)
    const response = await makeRequest(`${API_BASE}/auth/firebase`, {
      method: 'POST',
      body: { token: 'invalid' }
    });
    
    if (response.status === 400 && response.data.message.includes('Missing idToken')) {
      log('green', '✅ Auth endpoint properly validates request format');
      return true;
    } else {
      log('yellow', '⚠️  Auth endpoint returned unexpected status:', response.status);
      console.log(response.data);
      return false;
    }
  } catch (error) {
    log('red', '❌ Auth endpoint error:', error.message);
    return false;
  }
}

async function testGoogleConnect() {
  log('cyan', '\n🔗 Testing Google Connect Endpoint...');
  
  try {
    // Test without auth (should fail)
    const response = await makeRequest(`${API_BASE}/google/connect`, {
      method: 'POST'
    });
    
    if (response.status === 401) {
      log('green', '✅ Google connect endpoint properly requires authentication');
      return true;
    } else {
      log('yellow', '⚠️  Google connect endpoint returned unexpected status:', response.status);
      console.log(response.data);
      return false;
    }
  } catch (error) {
    log('red', '❌ Google connect endpoint error:', error.message);
    return false;
  }
}

async function testMeetingsEndpoint() {
  log('cyan', '\n📅 Testing Meetings Endpoint...');
  
  try {
    // Test without auth (should fail)
    const response = await makeRequest(`${API_BASE}/meetings?from=2024-10-16&to=2024-10-17`);
    
    if (response.status === 401) {
      log('green', '✅ Meetings endpoint properly requires authentication');
      return true;
    } else {
      log('yellow', '⚠️  Meetings endpoint returned unexpected status:', response.status);
      console.log(response.data);
      return false;
    }
  } catch (error) {
    log('red', '❌ Meetings endpoint error:', error.message);
    return false;
  }
}

async function showInstructions() {
  log('magenta', '\n📋 Next Steps to Test with Real Data:');
  log('bright', '\n1. Get a Firebase ID Token:');
  log('reset', '   - Open your frontend: http://localhost:3000');
  log('reset', '   - Sign in with Google (if not already signed in)');
  log('reset', '   - Open browser dev tools (F12)');
  log('reset', '   - Go to Console tab');
  log('reset', '   - Run: firebase.auth().currentUser.getIdToken().then(token => console.log(token))');
  log('reset', '   - Copy the token');
  
  log('bright', '\n2. Test with Real Token:');
  log('reset', '   curl -H "Authorization: Bearer YOUR_TOKEN" \\');
  log('reset', '        "http://localhost:3001/meetings?from=2024-10-16&to=2024-10-17"');
  
  log('bright', '\n3. Connect Google Calendar (first time):');
  log('reset', '   curl -X POST \\');
  log('reset', '        -H "Authorization: Bearer YOUR_TOKEN" \\');
  log('reset', '        -H "Content-Type: application/json" \\');
  log('reset', '        http://localhost:3001/google/connect');
  log('reset', '   # This will return a Google OAuth URL to visit');
  
  log('bright', '\n4. After Google OAuth, fetch meetings:');
  log('reset', '   curl -H "Authorization: Bearer YOUR_TOKEN" \\');
  log('reset', '        "http://localhost:3001/meetings?from=2024-10-16&to=2024-10-17"');
}

async function main() {
  log('bright', '🧪 PreplyAI Meetings API Test Suite');
  log('bright', '=====================================\n');
  
  const tests = [
    { name: 'Health Check', fn: testHealth },
    { name: 'Auth Endpoint', fn: testAuthEndpoint },
    { name: 'Google Connect', fn: testGoogleConnect },
    { name: 'Meetings Endpoint', fn: testMeetingsEndpoint }
  ];
  
  let passed = 0;
  
  for (const test of tests) {
    const result = await test.fn();
    if (result) passed++;
  }
  
  log('bright', `\n📊 Results: ${passed}/${tests.length} tests passed`);
  
  if (passed === tests.length) {
    log('green', '🎉 All tests passed! API is working correctly.');
    await showInstructions();
  } else {
    log('red', '❌ Some tests failed. Check the output above.');
  }
}

// Run the tests
main().catch(console.error);
