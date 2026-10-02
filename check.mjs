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

console.log('✔ All Ponytail self-checks passed successfully!');
