#!/usr/bin/env node
/**
 * Generate a secure random session secret for .env
 * Usage: node scripts/generate-session-secret.js
 */

const crypto = require('crypto');

const secret = crypto.randomBytes(64).toString('hex');

console.log('Generated SESSION_SECRET:');
console.log(secret);
console.log('\nAdd this to your apps/api/.env file:');
console.log(`SESSION_SECRET=${secret}`);

