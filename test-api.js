/**
 * Node.js test script for API endpoints
 * Run with: node test-api.js
 */

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

// Test configuration
const tests = [
  {
    name: 'GET /api/users/get (no auth)',
    method: 'GET',
    endpoint: '/api/users/get',
    expectStatus: 401,
    expectError: 'Unauthorized',
  },
  {
    name: 'GET /api/messages/get (no auth)',
    method: 'GET',
    endpoint: '/api/messages/get',
    expectStatus: 401,
    expectError: 'Unauthorized',
  },
  {
    name: 'POST /api/users/save (no auth)',
    method: 'POST',
    endpoint: '/api/users/save',
    body: {
      name: 'Test User',
      dateOfBirth: '1990-01-01',
      languages: ['english'],
    },
    expectStatus: 401,
    expectError: 'Unauthorized',
  },
  {
    name: 'POST /api/messages/save (no auth)',
    method: 'POST',
    endpoint: '/api/messages/save',
    body: {
      messages: [
        {
          id: '1',
          role: 'user',
          content: 'Hello',
          timestamp: Date.now(),
        },
      ],
    },
    expectStatus: 401,
    expectError: 'Unauthorized',
  },
  {
    name: 'POST /api/users/mobile (no auth)',
    method: 'POST',
    endpoint: '/api/users/mobile',
    body: {
      mobile: '1234567890',
    },
    expectStatus: 401,
    expectError: 'Unauthorized',
  },
  {
    name: 'GET /api/users/get-by-email (public, user not found)',
    method: 'GET',
    endpoint: '/api/users/get-by-email?email=test@example.com',
    expectStatus: 404,
    expectError: 'User not found',
  },
];

async function runTest(test) {
  try {
    const url = `${BASE_URL}${test.endpoint}`;
    const options = {
      method: test.method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    if (test.body) {
      options.body = JSON.stringify(test.body);
    }

    if (test.cookies) {
      options.headers['Cookie'] = test.cookies;
    }

    const response = await fetch(url, options);
    const data = await response.json();

    const passed =
      response.status === test.expectStatus &&
      (test.expectError ? data.error === test.expectError : true);

    console.log(
      `${passed ? '✅' : '❌'} ${test.name}`
    );
    console.log(`   Status: ${response.status} (expected: ${test.expectStatus})`);
    
    if (data.debug) {
      console.log(`   Debug info:`, JSON.stringify(data.debug, null, 2));
    }
    
    if (!passed) {
      console.log(`   Response:`, JSON.stringify(data, null, 2));
    }
    console.log('');

    return passed;
  } catch (error) {
    console.log(`❌ ${test.name}`);
    console.log(`   Error: ${error.message}`);
    console.log('');
    return false;
  }
}

async function runAllTests() {
  console.log('==========================================');
  console.log('API Endpoint Tests');
  console.log('==========================================');
  console.log(`Base URL: ${BASE_URL}`);
  console.log('');

  const results = await Promise.all(tests.map(runTest));
  const passed = results.filter(Boolean).length;
  const total = results.length;

  console.log('==========================================');
  console.log(`Results: ${passed}/${total} tests passed`);
  console.log('==========================================');

  if (passed === total) {
    console.log('✅ All tests passed!');
    process.exit(0);
  } else {
    console.log('❌ Some tests failed');
    process.exit(1);
  }
}

// Check if fetch is available (Node 18+)
if (typeof fetch === 'undefined') {
  console.error('Error: This script requires Node.js 18+ (for native fetch support)');
  console.error('Or install node-fetch: npm install node-fetch');
  process.exit(1);
}

runAllTests();

