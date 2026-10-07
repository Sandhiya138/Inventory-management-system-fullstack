import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { productService } from '../../services/productService';

export const fetchAllCategories = createAsyncThunk(
  'categories/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      return await productService.getCategories();
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to fetch categories');
    }
  }
);

export const fetchSubcategoriesByCat = createAsyncThunk(
  'categories/fetchSubcategories',
  async (categoryId, { rejectWithValue }) => {
    try {
      return await productService.getSubcategories(categoryId);
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to fetch subcategories');
    }
  }
);

const initialState = {
  categories: [],
  subcategories: [],
  selectedCategory: null,
  loading: false,
  error: null,
};

const categorySlice = createSlice({
  name: 'categories',
  initialState,
  reducers: {
    setSelectedCategory: (state, action) => {
      state.selectedCategory = action.payload;
    },
    clearCategoryError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllCategories.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllCategories.fulfilled, (state, action) => {
        state.loading = false;
        state.categories = action.payload || [];
      })
      .addCase(fetchAllCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchSubcategoriesByCat.fulfilled, (state, action) => {
        state.subcategories = action.payload || [];
      });
  },
});

export const { setSelectedCategory, clearCategoryError } = categorySlice.actions;
export default categorySlice.reducer;
