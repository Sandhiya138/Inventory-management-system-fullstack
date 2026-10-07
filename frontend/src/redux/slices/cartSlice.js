import { createSlice } from '@reduxjs/toolkit';

export const getCartStorageKey = (userId) => {
  if (userId) return `velvet_cart_${userId}`;
  try {
    const raw = localStorage.getItem('user');
    if (raw) {
      const u = JSON.parse(raw);
      if (u?.id) return `velvet_cart_${u.id}`;
      if (u?.email) return `velvet_cart_${u.email}`;
    }
  } catch {}
  return 'velvet_cart_guest';
};

const normalizeCartItem = (raw) => {
  const prod = raw.product || raw;
  const id = prod.id || raw.id || raw.productId;
  const productName = prod.productName || raw.productName || 'Item';
  const sku = prod.sku || raw.sku || '';
  const price = Number(prod.sellingPrice ?? raw.sellingPrice ?? raw.unitPrice ?? 0);
  const qty = Number(raw.quantity || 1);
  const maxStock = prod.quantity ?? prod.currentStock ?? raw.maxStock ?? 999;

  return {
    id,
    productId: id,
    product: {
      ...prod,
      id,
      productName,
      sku,
      sellingPrice: price,
    },
    productName,
    sku,
    sellingPrice: price,
    unitPrice: price,
    quantity: qty,
    maxStock,
  };
};

const loadCartFromStorage = (key) => {
  try {
    const storageKey = key || getCartStorageKey();
    const raw = localStorage.getItem(storageKey);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.map(normalizeCartItem) : [];
  } catch {
    return [];
  }
};

const saveCartToStorage = (items, key) => {
  try {
    const storageKey = key || getCartStorageKey();
    localStorage.setItem(storageKey, JSON.stringify(items));
  } catch {}
};

const calculateTotals = (items) => {
  const totalCount = items.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0);
  const totalAmount = items.reduce((sum, item) => {
    const price = Number(item.sellingPrice ?? item.unitPrice ?? item.product?.sellingPrice ?? 0);
    return sum + price * (Number(item.quantity) || 0);
  }, 0);
  return { totalCount, totalAmount: Number(totalAmount.toFixed(2)) };
};

const initialItems = loadCartFromStorage();
const initialTotals = calculateTotals(initialItems);

const initialState = {
  items: initialItems,
  totalCount: initialTotals.totalCount,
  totalAmount: initialTotals.totalAmount,
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    loadUserCart: (state, action) => {
      const userId = action.payload;
      const loaded = loadCartFromStorage(getCartStorageKey(userId));
      state.items = loaded;
      const totals = calculateTotals(loaded);
      state.totalCount = totals.totalCount;
      state.totalAmount = totals.totalAmount;
    },
    addToCart: (state, action) => {
      const payload = action.payload;
      const normalized = normalizeCartItem(payload);
      const existing = state.items.find((item) => item.id === normalized.id);

      if (existing) {
        existing.quantity += normalized.quantity;
      } else {
        state.items.push(normalized);
      }

      const totals = calculateTotals(state.items);
      state.totalCount = totals.totalCount;
      state.totalAmount = totals.totalAmount;
      saveCartToStorage(state.items);
    },
    updateQuantity: (state, action) => {
      const { productId, quantity } = action.payload;
      const item = state.items.find((i) => i.id === productId || i.product?.id === productId);

      if (item) {
        if (quantity <= 0) {
          state.items = state.items.filter(
            (i) => i.id !== productId && i.product?.id !== productId
          );
        } else {
          item.quantity = quantity;
        }
      }

      const totals = calculateTotals(state.items);
      state.totalCount = totals.totalCount;
      state.totalAmount = totals.totalAmount;
      saveCartToStorage(state.items);
    },
    removeFromCart: (state, action) => {
      const productId = action.payload;
      state.items = state.items.filter(
        (i) => i.id !== productId && i.product?.id !== productId
      );

      const totals = calculateTotals(state.items);
      state.totalCount = totals.totalCount;
      state.totalAmount = totals.totalAmount;
      saveCartToStorage(state.items);
    },
    clearCart: (state) => {
      state.items = [];
      state.totalCount = 0;
      state.totalAmount = 0;
      saveCartToStorage([]);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase('auth/login/fulfilled', (state, action) => {
        const userId = action.payload?.id;
        const loaded = loadCartFromStorage(getCartStorageKey(userId));
        state.items = loaded;
        const totals = calculateTotals(loaded);
        state.totalCount = totals.totalCount;
        state.totalAmount = totals.totalAmount;
      })
      .addCase('auth/logout', (state) => {
        state.items = [];
        state.totalCount = 0;
        state.totalAmount = 0;
      });
  },
});

export const { loadUserCart, addToCart, updateQuantity, removeFromCart, clearCart } = cartSlice.actions;
export default cartSlice.reducer;
