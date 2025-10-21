#!/usr/bin/env node

const { execSync } = require('child_process');

const API_URL = 'http://localhost:3001';

function runCurl(command) {
  try {
    const result = execSync(command, { encoding: 'utf8' });
    return { success: true, data: result };
  } catch (error) {
    return { success: false, error: error.message, status: error.status };
  }
}

function testGenerateBriefing() {
  console.log('🧪 Testing Generate Briefing Endpoint');
  console.log('=====================================');

  // Test 1: Check if endpoint exists (should return 401 without token)
  console.log('\n1. Testing endpoint without token...');
  const test1 = runCurl(`curl -s -o /dev/null -w "%{http_code}" -X POST "${API_URL}/meetings/test-meeting/generate"`);
  if (test1.success && test1.data === '401') {
    console.log('✅ Endpoint exists and requires authentication');
  } else {
    console.log('❌ Unexpected response:', test1.data || test1.error);
  }

  // Test 2: Check with invalid token
  console.log('\n2. Testing with invalid token...');
  const test2 = runCurl(`curl -s -o /dev/null -w "%{http_code}" -X POST "${API_URL}/meetings/test-meeting/generate" -H "Authorization: Bearer invalid-token"`);
  if (test2.success && test2.data === '401') {
    console.log('✅ Correctly rejects invalid token');
  } else {
    console.log('❌ Unexpected response:', test2.data || test2.error);
  }

  // Test 3: Check health endpoint
  console.log('\n3. Testing health endpoint...');
  const test3 = runCurl(`curl -s "${API_URL}/health"`);
  if (test3.success) {
    console.log('✅ Health endpoint working');
    try {
      const healthData = JSON.parse(test3.data);
      console.log('   Database:', healthData.services?.database?.status);
      console.log('   Redis:', healthData.services?.redis?.status);
    } catch (e) {
      console.log('   Response:', test3.data.substring(0, 100) + '...');
    }
  } else {
    console.log('❌ Health endpoint failed:', test3.error);
  }

  console.log('\n📋 Instructions:');
  console.log('1. Get a valid Firebase token from the browser console: getFirebaseToken()');
  console.log('2. Use it to test the generate endpoint:');
  console.log('   curl -X POST "http://localhost:3001/meetings/MEETING_ID/generate" \\');
  console.log('        -H "Authorization: Bearer YOUR_FIREBASE_TOKEN"');
  console.log('3. Check backend logs for any errors');
  console.log('\n🔧 Debug steps:');
  console.log('- Check if Redis is running (required for queue)');
  console.log('- Check backend logs for queue errors');
  console.log('- Verify the meeting ID exists in the database');
}

testGenerateBriefing();
