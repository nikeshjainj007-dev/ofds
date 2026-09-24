import puppeteer from 'puppeteer';
import path from 'path';

const ARTIFACT_DIR = 'C:/Users/nikes/.gemini/antigravity/brain/e26773ff-29ac-4121-aa53-a922742cf159';

async function runBrowserTest() {
  console.log('Launching Chrome browser...');
  const browser = await puppeteer.launch({
    headless: 'new',
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1280,900'],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 900 });

  // Listen to browser console logs
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));

  console.log('Navigating to http://localhost:5173...');
  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle2' });

  // 1. Home page screenshot
  console.log('Capturing home page screenshot...');
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'home_page.png') });

  // 2. Click "Sign In" button to open Auth Modal
  console.log('Opening Auth modal...');
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const btn = buttons.find(b => b.textContent && b.textContent.includes('Sign In'));
    if (btn) btn.click();
  });

  await new Promise(r => setTimeout(r, 800));

  // 3. Capture Auth State 1 (Email)
  console.log('Capturing Auth State 1 (Email)...');
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'auth_state1_email.png') });

  // 4. Type email using native page click and type
  console.log('Entering email and submitting...');
  await page.click('input[type="email"]');
  await page.type('input[type="email"]', 'foodie.delight2026@gmail.com', { delay: 20 });
  await new Promise(r => setTimeout(r, 300));

  // Press Enter or click Submit button
  console.log('Pressing Enter to submit Send OTP...');
  await page.keyboard.press('Enter');

  // Wait for State 2 transition (inputmode="numeric" inputs or heading change)
  console.log('Waiting for State 2 (6-digit OTP inputs)...');
  await page.waitForFunction(() => {
    return document.querySelectorAll('input[type="text"][inputmode="numeric"]').length === 6;
  }, { timeout: 20000 });

  await new Promise(r => setTimeout(r, 1200));

  // 5. Capture Auth State 2 (6-digit OTP form & Toast "OTP Sent")
  console.log('Capturing Auth State 2...');
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'auth_state2_otp.png') });

  // 6. Type 6-digit OTP code: 123456
  console.log('Entering test 6-digit OTP code 123456...');
  const otpInputs = await page.$$('input[type="text"][inputmode="numeric"]');
  const code = ['1', '2', '3', '4', '5', '6'];
  for (let i = 0; i < otpInputs.length; i++) {
    await otpInputs[i].type(code[i], { delay: 60 });
  }

  await new Promise(r => setTimeout(r, 600));

  // Click "Verify & Continue" or press Enter
  console.log('Submitting OTP verification...');
  await page.keyboard.press('Enter');

  // Wait for login success and modal close
  await new Promise(r => setTimeout(r, 2000));

  // 7. Capture Logged-In State
  console.log('Capturing logged-in state...');
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'logged_in_state.png') });

  // 8. Add dish to cart
  console.log('Adding pure veg dish to cart...');
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const addBtn = buttons.find(b => b.textContent && b.textContent.trim().toUpperCase().includes('ADD'));
    if (addBtn) addBtn.click();
  });

  await new Promise(r => setTimeout(r, 800));

  // If customization modal appeared, click Add to Cart inside it
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const confirmBtn = buttons.find(b => b.textContent && b.textContent.includes('Add to Cart'));
    if (confirmBtn) confirmBtn.click();
  });

  await new Promise(r => setTimeout(r, 800));

  // 9. Open Cart Drawer
  console.log('Opening Cart Drawer...');
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const cartBtn = buttons.find(b => b.textContent && b.textContent.includes('Cart'));
    if (cartBtn) cartBtn.click();
  });

  await new Promise(r => setTimeout(r, 1200));

  // 10. Capture Cart Drawer
  console.log('Capturing Cart Drawer...');
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'cart_drawer.png') });

  console.log('Browser tests completed successfully!');
  await browser.close();
}

runBrowserTest().catch(err => {
  console.error('Browser test failed:', err);
  process.exit(1);
});
