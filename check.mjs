import assert from 'node:assert';

// 1. Verify storage fallback behavior
const mockLocalStorage = (() => {
  let store = {};
  return {
    getItem: (k) => store[k] || null,
    setItem: (k, v) => { store[k] = String(v); },
    removeItem: (k) => { delete store[k]; },
    clear: () => { store = {}; },
  };
})();

globalThis.localStorage = mockLocalStorage;

const storage = {
  get(key, fallback) {
    try {
      const saved = localStorage.getItem(key);
      return saved ? JSON.parse(saved) : fallback;
    } catch {
      return fallback;
    }
  },
  set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {}
  },
  remove(key) {
    try {
      localStorage.removeItem(key);
    } catch {}
  }
};

// Test 1: Storage get fallback
assert.strictEqual(storage.get('unknown_key', 'fallback_val'), 'fallback_val');

// Test 2: Storage set & get
storage.set('test_dish', { id: 'd1', name: 'Dosa', price: 40 });
const saved = storage.get('test_dish', null);
assert.deepStrictEqual(saved, { id: 'd1', name: 'Dosa', price: 40 });

// Test 3: Storage remove
storage.remove('test_dish');
assert.strictEqual(storage.get('test_dish', null), null);

// Test 4: Route progress ladder check
const getRouteProgress = (status) => {
  switch (status) {
    case 'PLACED': return 5;
    case 'KITCHEN_PREPARING': return 20;
    case 'RIDER_ASSIGNED': return 45;
    case 'OUT_FOR_DELIVERY': return 70;
    case 'DELIVERED': return 100;
    default: return 35;
  }
};

assert.strictEqual(getRouteProgress('PLACED'), 5);
assert.strictEqual(getRouteProgress('DELIVERED'), 100);

// Test 5: Strong Password validation
const isStrongPassword = (pass) => {
  const minLength = pass.length >= 8;
  const hasUpper = /[A-Z]/.test(pass);
  const hasLower = /[a-z]/.test(pass);
  const hasNumber = /[0-9]/.test(pass);
  const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(pass);
  return minLength && hasUpper && hasLower && hasNumber && hasSpecial;
};

assert.strictEqual(isStrongPassword('weak'), false);
assert.strictEqual(isStrongPassword('weakpass123'), false); // missing upper & special
assert.strictEqual(isStrongPassword('WeakPass123'), false); // missing special
assert.strictEqual(isStrongPassword('WeakPass123!'), true); // all criteria met

// Test 6: Login credential fallback to signup redirect logic
const handleLoginResult = (result) => {
  if (!result.success) {
    return { redirect: 'signup', message: 'Account does not exist. Redirecting to Sign up option...' };
  }
  return { redirect: null, message: 'Logged in successfully!' };
};

const failedLogin = handleLoginResult({ success: false, accountNotExists: true });
assert.strictEqual(failedLogin.redirect, 'signup');

console.log('✔ All Ponytail self-checks passed successfully!');
