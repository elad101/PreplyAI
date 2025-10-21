#!/usr/bin/env node

/**
 * Test script to debug Google OAuth callback issues
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
  log('bright', '🧪 Google OAuth Callback Test');
  log('bright', '============================\n');
  
  log('cyan', 'Testing callback endpoint with mock data...');
  
  // Test the callback endpoint with a mock authorization code
  const testCode = 'mock_auth_code_12345';
  const testUserId = 'b0877357-91b2-45ca-92a2-213145685dc1'; // From the database
  
  try {
    const response = await makeRequest(`${API_BASE}/google/callback?code=${testCode}&state=${testUserId}`);
    
    log('blue', `Status: ${response.status}`);
    log('blue', `Response: ${JSON.stringify(response.data, null, 2)}`);
    
    if (response.status === 500) {
      log('red', '❌ Internal server error - check backend logs');
      log('yellow', 'Common causes:');
      log('reset', '1. Database connection issues');
      log('reset', '2. Invalid Google OAuth credentials');
      log('reset', '3. Missing environment variables');
      log('reset', '4. Prisma schema issues');
    } else if (response.status === 400) {
      log('yellow', '⚠️ Bad request - expected with mock code');
      log('reset', 'This is normal since we\'re using a fake authorization code');
    }
    
  } catch (error) {
    log('red', '❌ Request failed:', error.message);
  }
  
  log('cyan', '\nChecking database state...');
  log('reset', 'Run this to check current connections:');
  log('blue', 'docker exec preplyai-postgres psql -U preplyai -d preplyai -c "SELECT id, user_id, created_at FROM google_connections;"');
  
  log('cyan', '\nChecking backend health...');
  try {
    const healthResponse = await makeRequest(`${API_BASE}/health`);
    if (healthResponse.status === 200) {
      log('green', '✅ Backend is healthy');
      log('blue', `   Database: ${healthResponse.data.services.database.status}`);
      log('blue', `   Redis: ${healthResponse.data.services.redis.status}`);
    }
  } catch (error) {
    log('red', '❌ Backend health check failed');
  }
}

main().catch(console.error);
