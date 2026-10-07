import { createSlice } from '@reduxjs/toolkit';

const getInitialTheme = () => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('velvetstock-theme');
    if (saved) return saved;
  }
  return 'dark';
};

const initialState = {
  sidebarCollapsed: false,
  mobileSidebarOpen: false,
  theme: getInitialTheme(),
  toasts: [],
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleTheme: (state) => {
      const nextTheme = state.theme === 'light' ? 'dark' : 'light';
      state.theme = nextTheme;
      if (typeof window !== 'undefined') {
        localStorage.setItem('velvetstock-theme', nextTheme);
        document.documentElement.setAttribute('data-theme', nextTheme);
      }
    },
    setTheme: (state, action) => {
      const nextTheme = action.payload;
      state.theme = nextTheme;
      if (typeof window !== 'undefined') {
        localStorage.setItem('velvetstock-theme', nextTheme);
        document.documentElement.setAttribute('data-theme', nextTheme);
      }
    },
    toggleSidebar: (state) => {
      state.sidebarCollapsed = !state.sidebarCollapsed;
    },
    setSidebarCollapsed: (state, action) => {
      state.sidebarCollapsed = action.payload;
    },
    toggleMobileSidebar: (state) => {
      state.mobileSidebarOpen = !state.mobileSidebarOpen;
    },
    setMobileSidebarOpen: (state, action) => {
      state.mobileSidebarOpen = action.payload;
    },
    addToast: (state, action) => {
      const id = action.payload.id || (Date.now() + Math.random());
      state.toasts.push({
        id,
        type: action.payload.type || 'info', // success, error, info
        title: action.payload.title || '',
        message: action.payload.message || '',
      });
    },
    removeToast: (state, action) => {
      state.toasts = state.toasts.filter((t) => t.id !== action.payload);
    },
  },
});

export const {
  toggleTheme,
  setTheme,
  toggleSidebar,
  setSidebarCollapsed,
  toggleMobileSidebar,
  setMobileSidebarOpen,
  addToast,
  removeToast,
} = uiSlice.actions;

export default uiSlice.reducer;
