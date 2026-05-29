const http = require('http');

async function fetchPage(path) {
  return new Promise((resolve, reject) => {
    http.get('http://localhost:3000' + path, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, data }));
    }).on('error', (err) => {
      resolve({ status: 'Error', data: err.message });
    });
  });
}

async function runTests() {
  try {
    console.log('\n--- Testing Placeholder Pages ---');
    
    const pagesToTest = ['/deals', '/contacts', '/organizations', '/notes', '/tasks'];
    
    for (const page of pagesToTest) {
      const { status, data } = await fetchPage(page);
      
      if (status === 'Error') {
        console.log(`❌ Failed to connect to ${page}. Make sure your Next.js server is running on port 3000.`);
        continue;
      }

      const isSuccess = status === 200;
      
      const titleName = page.replace('/', '');
      const expectedText = `No ${titleName} found`;
      const hasPlaceholder = data.toLowerCase().includes(expectedText.toLowerCase());
      
      if (isSuccess && hasPlaceholder) {
        console.log(`✅ ${page} loaded successfully (Status 200) and rendered the Placeholder component.`);
      } else {
        console.log(`❌ ${page} failed. Status: ${status}`);
      }
    }
    
    console.log('\n--- Testing Sidebar Elements ---');
    const { status, data: appData } = await fetchPage('/deals');
    
    if (status !== 200) {
       console.log('Skipping sidebar tests due to connection error.');
       return;
    }
    
    if (appData.includes('Notifications')) {
      console.log('✅ Sidebar rendered successfully with the new Notifications element.');
    } else {
      console.log('❌ Could not find Notifications element in the rendered HTML.');
    }
    
    if (!appData.includes('href="/login"') && !appData.includes('href="/register"')) {
      console.log('✅ Sidebar successfully verified to have Auth links removed.');
    }

  } catch (err) {
    console.error('Test error:', err);
  }
}

runTests();
