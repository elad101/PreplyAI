// Copy and paste this code into your browser console at http://localhost:3000

// Method 1: Try to access Firebase through React DevTools
function getFirebaseToken() {
  // Check if React DevTools is available
  if (window.__REACT_DEVTOOLS_GLOBAL_HOOK__) {
    console.log('React DevTools detected. Looking for Firebase auth...');
    
    // Try to find the auth instance in React components
    const hook = window.__REACT_DEVTOOLS_GLOBAL_HOOK__;
    const renderers = hook.renderers;
    
    for (let id in renderers) {
      const renderer = renderers[id];
      if (renderer.findFiberByHostInstance) {
        // Look for AuthProvider component
        const root = renderer.getCurrentFiber;
        console.log('Found React renderer');
      }
    }
  }
  
  // Method 2: Try to access through window object
  if (window.auth) {
    console.log('Found auth on window object');
    return window.auth.currentUser?.getIdToken();
  }
  
  // Method 3: Check if Firebase is available globally
  if (window.firebase) {
    console.log('Found Firebase on window object');
    return window.firebase.auth().currentUser.getIdToken();
  }
  
  console.log('Firebase auth not found. Trying alternative methods...');
  return null;
}

// Method 4: Create a temporary Firebase instance
async function createTempFirebaseAuth() {
  try {
    // Import Firebase dynamically
    const { initializeApp } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js');
    const { getAuth } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js');
    
    // SECURITY: Never hardcode Firebase config in scripts
    // Use environment variables or get from your .env file
    console.error('❌ SECURITY WARNING: This script should not contain hardcoded Firebase credentials');
    console.error('Please use environment variables or load from your .env file');
    return null;
    
    // Function disabled for security - no hardcoded credentials
    console.log('❌ This function is disabled for security reasons');
    console.log('Please use the proper authentication flow in your application');
    return null;
  } catch (error) {
    console.error('Error creating Firebase auth:', error);
    return null;
  }
}

// Method 5: Try to intercept the existing auth instance
function tryGetExistingAuth() {
  // Look for Firebase instances in the page
  const scripts = document.querySelectorAll('script');
  for (let script of scripts) {
    if (script.src && script.src.includes('firebase')) {
      console.log('Found Firebase script:', script.src);
    }
  }
  
  // Check if there's a global Firebase instance
  if (window.firebase || window.auth || window.__FIREBASE_AUTH__) {
    console.log('Found potential Firebase instances');
    console.log('window.firebase:', !!window.firebase);
    console.log('window.auth:', !!window.auth);
    console.log('window.__FIREBASE_AUTH__:', !!window.__FIREBASE_AUTH__);
  }
  
  return null;
}

// Main function to try all methods
async function getToken() {
  console.log('🔑 Attempting to get Firebase token...');
  
  // Try method 1
  let token = getFirebaseToken();
  if (token) {
    token = await token;
    if (token) {
      console.log('✅ Got token via React DevTools');
      return token;
    }
  }
  
  // Try method 4 (create temporary instance)
  console.log('Trying to create temporary Firebase auth...');
  token = await createTempFirebaseAuth();
  if (token) {
    return token;
  }
  
  // Try method 5
  tryGetExistingAuth();
  
  console.log('❌ Could not get Firebase token. Please try:');
  console.log('1. Make sure you are signed in at http://localhost:3000');
  console.log('2. Refresh the page and try again');
  console.log('3. Check the browser console for any Firebase errors');
  
  return null;
}

// Run the function
getToken().then(token => {
  if (token) {
    console.log('\n🚀 Ready to test API:');
    console.log(`curl -H "Authorization: Bearer ${token}" "http://localhost:3001/meetings?from=2024-10-16T00:00:00Z&to=2024-10-17T23:59:59Z"`);
  }
});

console.log('📋 Instructions:');
console.log('1. Go to http://localhost:3000');
console.log('2. Sign in with Google');
console.log('3. Open DevTools (F12) → Console');
console.log('4. Copy and paste this entire script');
console.log('5. Press Enter');
