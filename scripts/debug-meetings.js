#!/usr/bin/env node

/**
 * Debug script for meetings endpoint issues
 * 
 * This script helps debug the meetings endpoint by testing each step
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

async function testStep(step, testFn) {
  log('cyan', `\n${step}`);
  log('yellow', '='.repeat(50));
  
  try {
    const result = await testFn();
    if (result.success) {
      log('green', `✅ ${step} - SUCCESS`);
      if (result.data) {
        log('blue', `   ${result.data}`);
      }
      return true;
    } else {
      log('red', `❌ ${step} - FAILED`);
      log('red', `   ${result.error}`);
      return false;
    }
  } catch (error) {
    log('red', `❌ ${step} - ERROR`);
    log('red', `   ${error.message}`);
    return false;
  }
}

async function getTokenFromUser() {
  const rl = createInterface();
  
  return new Promise((resolve) => {
    log('magenta', '\n🔑 Enter your Firebase token to debug the meetings endpoint:');
    log('yellow', '   Get it from: http://localhost:3000 → F12 → Console → firebase.auth().currentUser.getIdToken()');
    
    rl.question('\nToken: ', (token) => {
      rl.close();
      resolve(token.trim());
    });
  });
}

async function main() {
  log('bright', '🐛 Meetings Endpoint Debugger');
  log('bright', '============================\n');
  
  const token = await getTokenFromUser();
  
  if (!token) {
    log('red', 'No token provided. Exiting...');
    return;
  }
  
  let allPassed = true;
  
  // Step 1: Test token validation
  allPassed &= await testStep('Step 1: Validating Firebase Token', async () => {
    const response = await makeRequest(`${API_BASE}/auth/firebase`, {
      method: 'POST',
      body: { idToken: token }
    });
    
    if (response.status === 200) {
      return {
        success: true,
        data: `User: ${response.data.user.email} (${response.data.uid})`
      };
    } else {
      return {
        success: false,
        error: `Status ${response.status}: ${response.data.message}`
      };
    }
  });
  
  if (!allPassed) {
    log('red', '\n❌ Token validation failed. Cannot proceed.');
    return;
  }
  
  // Step 2: Test auth middleware
  allPassed &= await testStep('Step 2: Testing Auth Middleware', async () => {
    const response = await makeRequest(`${API_BASE}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    if (response.status === 200) {
      return {
        success: true,
        data: `Auth middleware working for user: ${response.data.user.email}`
      };
    } else {
      return {
        success: false,
        error: `Status ${response.status}: ${response.data.message}`
      };
    }
  });
  
  // Step 3: Test meetings endpoint without parameters
  allPassed &= await testStep('Step 3: Testing Meetings Endpoint (no params)', async () => {
    const response = await makeRequest(`${API_BASE}/meetings`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    if (response.status === 400 && response.data.message.includes('Missing required query parameters')) {
      return {
        success: true,
        data: 'Correctly validates query parameters'
      };
    } else {
      return {
        success: false,
        error: `Expected 400 for missing params, got ${response.status}: ${JSON.stringify(response.data)}`
      };
    }
  });
  
  // Step 4: Test meetings endpoint with parameters
  allPassed &= await testStep('Step 4: Testing Meetings Endpoint (with params)', async () => {
    const from = '2024-10-16T00:00:00Z';
    const to = '2024-10-17T23:59:59Z';
    
    const response = await makeRequest(`${API_BASE}/meetings?from=${from}&to=${to}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    if (response.status === 200) {
      return {
        success: true,
        data: `Found ${response.data.meetings.length} meetings, cached: ${response.data.cached}`
      };
    } else if (response.status === 403) {
      return {
        success: true,
        data: 'Google account not connected yet (this is expected for first-time users)'
      };
    } else {
      return {
        success: false,
        error: `Unexpected status ${response.status}: ${JSON.stringify(response.data)}`
      };
    }
  });
  
  // Step 5: Test Google connect
  allPassed &= await testStep('Step 5: Testing Google Connect', async () => {
    const response = await makeRequest(`${API_BASE}/google/connect`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` }
    });
    
    if (response.status === 200) {
      return {
        success: true,
        data: `Google OAuth URL generated successfully`
      };
    } else {
      return {
        success: false,
        error: `Status ${response.status}: ${JSON.stringify(response.data)}`
      };
    }
  });
  
  // Summary
  log('bright', '\n📊 Debug Summary');
  log('bright', '================');
  
  if (allPassed) {
    log('green', '🎉 All tests passed! Your API is working correctly.');
    log('yellow', '\n💡 If you\'re still getting 400 errors:');
    log('reset', '   1. Make sure you\'re passing both ?from= and ?to= parameters');
    log('reset', '   2. Connect your Google account first via /google/connect');
    log('reset', '   3. Check the date format (use ISO format like 2024-10-16T00:00:00Z)');
  } else {
    log('red', '❌ Some tests failed. Check the errors above.');
  }
  
  log('bright', '\n🔧 Quick Commands:');
  log('yellow', '# Test meetings with proper format:');
  log('reset', `curl -H "Authorization: Bearer ${token}" "http://localhost:3001/meetings?from=2024-10-16T00:00:00Z&to=2024-10-17T23:59:59Z"`);
  log('yellow', '# Connect Google account:');
  log('reset', `curl -X POST -H "Authorization: Bearer ${token}" http://localhost:3001/google/connect`);
}

// Run the debugger
main().catch(console.error);
