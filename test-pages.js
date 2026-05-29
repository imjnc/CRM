const http = require('http');
const { spawn } = require('child_process');

console.log('Starting Next.js production server...');
// Use shell to run the command on Windows properly
const server = spawn('npm', ['run', 'start'], { stdio: 'pipe', shell: true });

let isReady = false;
server.stdout.on('data', (data) => {
  const output = data.toString();
  if (output.includes('Ready') || output.includes('started server on') || output.includes('Listening on') || output.includes('ready started server')) {
    if (!isReady) {
      isReady = true;
      console.log('Server is ready! Running tests...');
      setTimeout(runTests, 2000); // Give it a moment to fully bind
    }
  }
});

server.stderr.on('data', (data) => {
  // Ignore standard Next.js warnings
});

async function fetchPage(path) {
  return new Promise((resolve, reject) => {
    http.get('http://localhost:3000' + path, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, data }));
    }).on('error', reject);
  });
}

async function runTests() {
  try {
    console.log('\n--- Testing Placeholder Pages ---');
    
    const pagesToTest = ['/deals', '/contacts', '/organizations', '/notes', '/tasks'];
    
    for (const page of pagesToTest) {
      const { status, data } = await fetchPage(page);
      const isSuccess = status === 200;
      
      // We expect the placeholder text to be present in the HTML (e.g. "No deals found")
      const titleName = page.replace('/', '');
      const expectedText = `No ${titleName} found`;
      const hasPlaceholder = data.toLowerCase().includes(expectedText.toLowerCase());
      
      if (isSuccess && hasPlaceholder) {
        console.log(`✅ ${page} loaded successfully (Status 200) and rendered the Placeholder component.`);
      } else {
        console.log(`❌ ${page} failed. Status: ${status}, Has Placeholder Text: ${hasPlaceholder}`);
      }
    }
    
    console.log('\n--- Testing Sidebar Elements ---');
    const { data: appData } = await fetchPage('/deals');
    
    // Check for "Notifications" text which we added to the sidebar
    if (appData.includes('Notifications')) {
      console.log('✅ Sidebar rendered successfully with the new Notifications element.');
    } else {
      console.log('❌ Could not find Notifications element in the rendered HTML.');
    }
    
    // Check that "Login" and "Register" are missing (we removed them)
    if (!appData.includes('href="/login"') && !appData.includes('href="/register"')) {
      console.log('✅ Sidebar successfully verified to have Auth links removed.');
    }

  } catch (err) {
    console.error('Test error:', err);
  } finally {
    server.kill();
    console.log('\nTests completed, server stopped.');
    process.exit(0);
  }
}

// Timeout to prevent hanging
setTimeout(() => {
  console.log('Timeout reached. Killing server.');
  server.kill();
  process.exit(1);
}, 20000);
