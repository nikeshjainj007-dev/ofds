import assert from 'assert';
import crypto from 'crypto';
import sendOtpHandler from './api/send-otp.js';
import verifyOtpHandler from './api/verify-otp.js';

// Mock request / response helpers
function createMockReq(body, method = 'POST') {
  return {
    method,
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  };
}

function createMockRes() {
  const res = {
    statusCode: 200,
    headers: {},
    data: null,
    setHeader(key, val) { this.headers[key] = val; },
    status(code) { this.statusCode = code; return this; },
    json(obj) { this.data = obj; return this; },
    end(str) { if (str && !this.data) { try { this.data = JSON.parse(str); } catch { this.data = str; } } }
  };
  return res;
}

async function runSecurityTests() {
  console.log('--- RUNNING SECURITY CONSTRAINT TESTS ---');

  const testEmail = `sec_test_${Date.now()}@campus.edu`;

  // 1. Test Send OTP: Check No Leakage & Valid Token Structure
  const sendReq = createMockReq({ email: testEmail });
  const sendRes = createMockRes();
  await sendOtpHandler(sendReq, sendRes);

  assert.strictEqual(sendRes.statusCode, 200, 'send-otp must return HTTP 200');
  assert.ok(sendRes.data.success, 'send-otp success flag must be true');
  assert.ok(sendRes.data.otpToken, 'send-otp must return an otpToken');

  // CRITICAL CONSTRAINT: OTP must NOT be leaked to frontend
  assert.strictEqual(sendRes.data.otpCode, undefined, 'CRITICAL: otpCode must NEVER exist in response');
  assert.strictEqual(sendRes.data.displayOtpMessage, undefined, 'CRITICAL: displayOtpMessage must NEVER exist');

  // Verify otpToken is HMAC.expiresAt and does NOT include the plain code
  const tokenParts = sendRes.data.otpToken.split('.');
  assert.strictEqual(tokenParts.length, 2, 'Token must strictly contain [hmac, expiresAt]');
  assert.strictEqual(tokenParts[0].length, 64, 'HMAC must be 64-character SHA-256 hex string');
  assert.ok(!isNaN(parseInt(tokenParts[1], 10)), 'Second token part must be a timestamp');

  console.log('✓ Test 1 Passed: No OTP code leakage in send-otp API response');

  // 2. Test Hardcoded Bypass Codes: MUST BE REJECTED
  const bypassCodes = ['123456', '012345', '12345', '849201'];
  for (const bypassCode of bypassCodes) {
    const bypassReq = createMockReq({
      email: testEmail,
      code: bypassCode,
      otpToken: sendRes.data.otpToken,
    });
    const bypassRes = createMockRes();
    await verifyOtpHandler(bypassReq, bypassRes);

    assert.strictEqual(bypassRes.statusCode, 400, `Bypass code ${bypassCode} MUST be rejected with HTTP 400`);
    assert.strictEqual(bypassRes.data.success, false, `Bypass code ${bypassCode} success must be false`);
  }
  console.log('✓ Test 2 Passed: All hardcoded bypass codes (123456, 012345, etc.) are strictly rejected');

  // 3. Test Legitimate OTP Verification with signed HMAC
  // Simulate backend genuine OTP code
  const validOtp = '582914';
  const expiresAt = Date.now() + 600000;
  const secretKey = process.env.OTP_SECRET_KEY || process.env.TWILIO_AUTH_TOKEN || 'satvikbite-secure-auth-secret-hmac-key';
  const dataToSign = `${testEmail}:${validOtp}:${expiresAt}`;
  const validHmac = crypto.createHmac('sha256', secretKey).update(dataToSign).digest('hex');
  const validToken = `${validHmac}.${expiresAt}`;

  const validReq = createMockReq({
    email: testEmail,
    code: validOtp,
    otpToken: validToken,
  });
  const validRes = createMockRes();
  await verifyOtpHandler(validReq, validRes);

  assert.strictEqual(validRes.statusCode, 200, 'Valid OTP must verify with HTTP 200');
  assert.strictEqual(validRes.data.success, true, 'Valid OTP response success must be true');
  console.log('✓ Test 3 Passed: Authentic dynamically generated OTP verified successfully');

  // 4. Test Expired OTP: MUST BE REJECTED
  const pastExpiresAt = Date.now() - 5000; // 5 seconds ago
  const expiredData = `${testEmail}:${validOtp}:${pastExpiresAt}`;
  const expiredHmac = crypto.createHmac('sha256', secretKey).update(expiredData).digest('hex');
  const expiredToken = `${expiredHmac}.${pastExpiresAt}`;

  const expiredReq = createMockReq({
    email: testEmail,
    code: validOtp,
    otpToken: expiredToken,
  });
  const expiredRes = createMockRes();
  await verifyOtpHandler(expiredReq, expiredRes);

  assert.strictEqual(expiredRes.statusCode, 400, 'Expired OTP must be rejected with HTTP 400');
  assert.strictEqual(expiredRes.data.success, false, 'Expired OTP success must be false');
  console.log('✓ Test 4 Passed: Expired OTP is strictly rejected');

  // 5. Test Tampered Email: MUST BE REJECTED
  const tamperedReq = createMockReq({
    email: 'attacker@campus.edu',
    code: validOtp,
    otpToken: validToken,
  });
  const tamperedRes = createMockRes();
  await verifyOtpHandler(tamperedReq, tamperedRes);

  assert.strictEqual(tamperedRes.statusCode, 400, 'Tampered email must be rejected with HTTP 400');
  assert.strictEqual(tamperedRes.data.success, false, 'Tampered email success must be false');
  console.log('✓ Test 5 Passed: Tampered email identity is strictly rejected');

  console.log('--- ALL AUTH SECURITY TESTS PASSED SUCCESSFULLY! ---');
}

runSecurityTests().catch((err) => {
  console.error('Security test failed:', err);
  process.exit(1);
});
