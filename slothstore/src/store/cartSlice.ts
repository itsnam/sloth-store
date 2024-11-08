import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface CartState {
  productCount: number;
}

const initialState: CartState = {
  productCount: 0,
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    setProductCount(state, action: PayloadAction<number>) {
      state.productCount = action.payload;
    },
  },
});

export const { setProductCount } = cartSlice.actions;

export default cartSlice.reducer;
