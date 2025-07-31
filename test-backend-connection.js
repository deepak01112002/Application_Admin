// Test script to verify admin panel can connect to live backend
const https = require('https');

const BACKEND_URL = 'https://server.ghanshyammurtibhandar.com';

console.log('🔍 Testing connection to live backend...');
console.log(`Backend URL: ${BACKEND_URL}`);

// Test endpoints
const testEndpoints = [
  '/health',
  '/api/documentation',
  '/api/admin/stats',
  '/api/products',
  '/api/categories'
];

async function testEndpoint(endpoint) {
  return new Promise((resolve) => {
    const url = `${BACKEND_URL}${endpoint}`;
    console.log(`\n📡 Testing: ${url}`);
    
    const req = https.get(url, (res) => {
      console.log(`✅ Status: ${res.statusCode}`);
      console.log(`📋 Headers: ${JSON.stringify(res.headers, null, 2)}`);
      
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          if (res.headers['content-type']?.includes('application/json')) {
            const jsonData = JSON.parse(data);
            console.log(`📄 Response: ${JSON.stringify(jsonData, null, 2)}`);
          } else {
            console.log(`📄 Response (first 200 chars): ${data.substring(0, 200)}...`);
          }
        } catch (e) {
          console.log(`📄 Response (raw): ${data.substring(0, 200)}...`);
        }
        resolve({ endpoint, status: res.statusCode, success: res.statusCode < 400 });
      });
    });
    
    req.on('error', (error) => {
      console.log(`❌ Error: ${error.message}`);
      resolve({ endpoint, status: 'ERROR', success: false, error: error.message });
    });
    
    req.setTimeout(10000, () => {
      console.log(`⏰ Timeout for ${endpoint}`);
      req.destroy();
      resolve({ endpoint, status: 'TIMEOUT', success: false, error: 'Timeout' });
    });
  });
}

async function runTests() {
  console.log('🚀 Starting backend connectivity tests...\n');
  
  const results = [];
  
  for (const endpoint of testEndpoints) {
    const result = await testEndpoint(endpoint);
    results.push(result);
    
    // Wait a bit between requests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log('\n📊 TEST RESULTS SUMMARY:');
  console.log('=' .repeat(50));
  
  let successCount = 0;
  results.forEach(result => {
    const status = result.success ? '✅ PASS' : '❌ FAIL';
    console.log(`${status} ${result.endpoint} - ${result.status}`);
    if (result.success) successCount++;
  });
  
  console.log('=' .repeat(50));
  console.log(`📈 Success Rate: ${successCount}/${results.length} (${Math.round(successCount/results.length*100)}%)`);
  
  if (successCount === results.length) {
    console.log('🎉 ALL TESTS PASSED! Your admin panel can connect to the live backend!');
  } else if (successCount > 0) {
    console.log('⚠️  PARTIAL SUCCESS: Some endpoints are working. Check CORS and authentication.');
  } else {
    console.log('❌ ALL TESTS FAILED: Check if backend is running and accessible.');
  }
  
  console.log('\n🔗 Admin Panel URLs:');
  console.log(`- Local Development: http://localhost:3001`);
  console.log(`- Production (after deployment): https://admin.ghanshyammurtibhandar.com`);
  
  console.log('\n🔧 Backend URLs:');
  console.log(`- API Base: ${BACKEND_URL}/api`);
  console.log(`- Swagger Docs: ${BACKEND_URL}/api/docs`);
  console.log(`- Health Check: ${BACKEND_URL}/health`);
}

runTests().catch(console.error);
