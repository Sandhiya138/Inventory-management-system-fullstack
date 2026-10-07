import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { productService } from '../../services/productService';

export const fetchProducts = createAsyncThunk(
  'products/fetchProducts',
  async (params, { rejectWithValue }) => {
    try {
      return await productService.getProducts(params);
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const fetchCategories = createAsyncThunk(
  'products/fetchCategories',
  async (_, { rejectWithValue }) => {
    try {
      return await productService.getCategories();
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const fetchSubcategories = createAsyncThunk(
  'products/fetchSubcategories',
  async (categoryId, { rejectWithValue }) => {
    try {
      return await productService.getSubcategories(categoryId);
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const fetchSuppliers = createAsyncThunk(
  'products/fetchSuppliers',
  async (_, { rejectWithValue }) => {
    try {
      return await productService.getSuppliers();
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

const initialState = {
  items: [],
  categories: [],
  subcategories: [],
  suppliers: [],
  selectedProduct: null,
  loading: false,
  error: null,
  filters: {
    search: '',
    categoryId: '',
    subcategoryId: '',
    status: '',
  },
};

const productSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    setSelectedProduct: (state, action) => {
      state.selectedProduct = action.payload;
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    resetFilters: (state) => {
      state.filters = {
        search: '',
        categoryId: '',
        subcategoryId: '',
        status: '',
      };
    },
  },
  extraReducers: (builder) => {
    builder
      // Products
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload || [];
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Categories
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.categories = action.payload || [];
      })
      // Subcategories
      .addCase(fetchSubcategories.fulfilled, (state, action) => {
        state.subcategories = action.payload || [];
      })
      // Suppliers
      .addCase(fetchSuppliers.fulfilled, (state, action) => {
        state.suppliers = action.payload || [];
      });
  },
});

export const { setSelectedProduct, setFilters, resetFilters } = productSlice.actions;
export default productSlice.reducer;
