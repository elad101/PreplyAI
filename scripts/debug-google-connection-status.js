#!/usr/bin/env node

/**
 * Debug script to check Google Calendar connection status in the database
 */

const https = require('https');
const http = require('http');

const API_BASE = 'http://localhost:3001';

// Colors for console output
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

async function main() {
  log('bright', '🔍 Google Calendar Connection Status Debugger');
  log('bright', '===========================================\n');
  
  log('yellow', 'This script will help debug why the Google Calendar connection');
  log('yellow', 'isn\'t working even after successful OAuth flow.\n');
  
  log('cyan', 'Step 1: Check if backend is running...');
  try {
    const healthResponse = await makeRequest(`${API_BASE}/health`);
    if (healthResponse.status === 200) {
      log('green', '✅ Backend is running');
      log('blue', `   Database: ${healthResponse.data.services.database.status}`);
      log('blue', `   Redis: ${healthResponse.data.services.redis.status}`);
    } else {
      log('red', '❌ Backend health check failed');
      return;
    }
  } catch (error) {
    log('red', '❌ Backend is not running or not accessible');
    log('reset', '   Make sure your API server is running on port 3001');
    return;
  }
  
  log('cyan', '\nStep 2: Check database connection...');
  log('reset', '   We need to verify if the Google OAuth tokens were stored in the database.');
  log('reset', '   You can check this by:');
  log('reset', '   1. Looking at your backend logs for any database errors');
  log('reset', '   2. Checking the PostgreSQL database directly');
  
  log('cyan', '\nStep 3: Manual database check...');
  log('reset', '   Run this command to check your database:');
  log('blue', '   psql -d preplyai -c "SELECT * FROM google_connections;"');
  
  log('cyan', '\nStep 4: Check Google OAuth callback...');
  log('reset', '   The OAuth callback should have:');
  log('reset', '   1. Received the authorization code from Google');
  log('reset', '   2. Exchanged it for access/refresh tokens');
  log('reset', '   3. Stored the tokens in the database');
  
  log('yellow', '\n💡 Common issues:');
  log('reset', '1. Database connection failed during OAuth callback');
  log('reset', '2. Google OAuth tokens expired or invalid');
  log('reset', '3. User ID mismatch between Firebase and database');
  log('reset', '4. Redis connection issues affecting token storage');
  
  log('bright', '\n🔧 Next steps:');
  log('reset', '1. Check your backend logs for any errors');
  log('reset', '2. Verify the database contains the Google connection');
  log('reset', '3. Try the OAuth flow again with browser dev tools open');
  log('reset', '4. Check if the callback URL is working correctly');
}

main().catch(console.error);
