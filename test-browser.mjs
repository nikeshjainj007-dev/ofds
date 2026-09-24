import puppeteer from 'puppeteer';
import path from 'path';

const ARTIFACT_DIR = 'C:/Users/nikes/.gemini/antigravity/brain/ec1d72cb-8916-480c-ac46-c540952f80d9';

async function runOtpFlowTest() {
  console.log('Launching Chrome browser for OTP test with different number (9876543210)...');
  const browser = await puppeteer.launch({
    headless: 'new',
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1280,900'],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 900 });

  page.on('console', msg => console.log('PAGE LOG:', msg.text()));

  console.log('Navigating to http://localhost:5173...');
  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle2' });

  // Clear any existing localStorage
  await page.evaluate(() => localStorage.clear());
  await page.reload({ waitUntil: 'networkidle2' });

  // 1. Open Auth modal
  console.log('Opening Auth modal...');
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const btn = buttons.find(b => b.textContent && b.textContent.includes('Sign In'));
    if (btn) btn.click();
  });

  await new Promise(r => setTimeout(r, 600));

  // 2. Switch to Mobile OTP
  console.log('Switching to Mobile OTP tab...');
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const btn = buttons.find(b => b.textContent && b.textContent.includes('Mobile OTP'));
    if (btn) btn.click();
  });

  await new Promise(r => setTimeout(r, 500));

  // 3. Type DIFFERENT phone number 9876543210
  console.log('Entering different phone number 9876543210...');
  await page.click('input[type="tel"]');
  await page.type('input[type="tel"]', '9876543210', { delay: 30 });
  await new Promise(r => setTimeout(r, 400));

  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'otp_different_number_input.png') });

  // 4. Click Send OTP
  console.log('Submitting Send OTP for 9876543210...');
  await page.keyboard.press('Enter');

  // Wait for State 2 transition
  console.log('Waiting for State 2 (6-digit OTP inputs)...');
  await page.waitForFunction(() => {
    return document.querySelectorAll('input[type="text"][inputmode="numeric"]').length === 6;
  }, { timeout: 15000 });

  await new Promise(r => setTimeout(r, 1000));

  // 5. Capture State 2 showing generated OTP and Auto-fill button
  console.log('Capturing State 2 with auto-fill button...');
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'otp_state2_different_number.png') });

  // 6. Click Auto-fill button
  console.log('Clicking Auto-fill button...');
  const autoFillClicked = await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const autoFillBtn = buttons.find(b => b.textContent && b.textContent.includes('Auto-fill'));
    if (autoFillBtn) {
      autoFillBtn.click();
      return true;
    }
    return false;
  });
  console.log('Auto-fill clicked:', autoFillClicked);

  await new Promise(r => setTimeout(r, 600));

  // 7. Submit OTP verification
  console.log('Submitting OTP verification...');
  await page.keyboard.press('Enter');

  // Wait for login success
  await new Promise(r => setTimeout(r, 2000));

  // 8. Capture logged in state with phone
  console.log('Capturing logged-in customer state with different phone...');
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'otp_logged_in_different_number.png') });

  console.log('Different number OTP test completed successfully!');
  await browser.close();
}

runOtpFlowTest().catch(err => {
  console.error('Test failed:', err);
  process.exit(1);
});
