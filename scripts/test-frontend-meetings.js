#!/usr/bin/env node

/**
 * Test script to debug frontend meetings loading
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
  log('bright', '🧪 Frontend Meetings Test');
  log('bright', '========================\n');
  
  // Test with the same token that's failing in the frontend
  const token = 'eyJhbGciOiJSUzI1NiIsImtpZCI6ImE1YTAwNWU5N2NiMWU0MjczMDBlNTJjZGQ1MGYwYjM2Y2Q4MDYyOWIiLCJ0eXAiOiJKV1QifQ.eyJuYW1lIjoiRWxhZCBHb2xhbiIsInBpY3R1cmUiOiJodHRwczovL2xoMy5nb29nbGV1c2VyY29udGVudC5jb20vYS9BQ2c4b2NKVGFEQVdVTGx0ZEtRa0c0OUdiN19yc2RVYnd0X2NrYTk5R1FodktNaXNNTTJtUS1vSz1zOTYtYyIsImlzcyI6Imh0dHBzOi8vc2VjdXJldG9rZW4uZ29vZ2xlLmNvbS9wcmVwbHlhaS05NzZlOSIsImF1ZCI6InByZXBseWFpLTk3NmU5IiwiYXV0aF90aW1lIjoxNzYwNTgzNzU0LCJ1c2VyX2lkIjoiNjdzQldsa1M3VmZJWGhrRDhCNkZNV0lScVMyMiIsInN1YiI6IjY3c0JXbGtTN1ZmSVhoa0Q4QjZGTVdJUnFTMjIiLCJpYXQiOjE3NjA2NTQzNDQsImV4cCI6MTc2MDY1Nzk0NCwiZW1haWwiOiJ0aGVnZW5kYUBnbWFpbC5jb20iLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwiZmlyZWJhc2UiOnsiaWRlbnRpdGllcyI6eyJnb29nbGUuY29tIjpbIjExMDc0NjQ4ODg1Nzk5MzgzMjIzMyJdLCJlbWFpbCI6WyJ0aGVnZW5kYUBnbWFpbC5jb20iXX0sInNpZ25faW5fcHJvdmlkZXIiOiJnb29nbGUuY29tIn19.Mpbz0eC-FYglpGVEk8OeO8j-wQFYiDCxrhxyAexe6Hk4fokECSlr2JfbMItIIU4WMzIA0aPQuTHiNOTASgBrt2t0Q73KktiCZerk-Zpdjef1yxSKGfzk_MxaUbHvJIaPzEkB-5SYCz0zz56KvJx1tOFFnhNasNePAfwAD83PXxnnXJcB6hqauMKECrojtUHhTErqWCThnQo7WIn3ASGmDvIptRiUnIXG-e1VuMKlVTo3kBN5ROa-E393MrHJR9w3_cbGn8fv2c3LfPtcq1g6rnT8Bq9ymL8gJNvYnB_ILZnNwMc-abZr8LK8MyPRCIgW1PU5qbWznmsubu89YGkWhQ';
  
  log('cyan', 'Testing meetings endpoint with frontend token...');
  
  try {
    const from = new Date().toISOString();
    const to = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
    
    const response = await makeRequest(`${API_BASE}/meetings?from=${from}&to=${to}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    log('blue', `Status: ${response.status}`);
    
    if (response.status === 200) {
      log('green', '✅ Meetings loaded successfully!');
      log('blue', `Found ${response.data.meetings.length} meetings:`);
      response.data.meetings.forEach((meeting, index) => {
        log('reset', `  ${index + 1}. ${meeting.summary || 'Untitled Meeting'}`);
        log('reset', `     Time: ${meeting.startTime}`);
        log('reset', `     Organizer: ${meeting.organizer?.email || 'Unknown'}`);
      });
    } else if (response.status === 403) {
      log('red', '❌ 403 Forbidden - Google account not connected');
      log('yellow', 'This suggests the Google connection was lost or expired');
    } else {
      log('red', `❌ Error: ${response.status}`);
      log('reset', JSON.stringify(response.data, null, 2));
    }
    
  } catch (error) {
    log('red', '❌ Request failed:', error.message);
  }
  
  log('cyan', '\nChecking token expiration...');
  try {
    // Decode the JWT token (just the payload part)
    const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
    const exp = new Date(payload.exp * 1000);
    const now = new Date();
    
    log('blue', `Token expires: ${exp.toISOString()}`);
    log('blue', `Current time: ${now.toISOString()}`);
    
    if (exp < now) {
      log('red', '❌ Token is expired!');
    } else {
      log('green', '✅ Token is valid');
      const timeLeft = Math.round((exp - now) / 1000 / 60);
      log('blue', `Time left: ${timeLeft} minutes`);
    }
  } catch (error) {
    log('red', '❌ Failed to decode token:', error.message);
  }
}

main().catch(console.error);
