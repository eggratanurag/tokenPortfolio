import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

interface Token {
  id: string;
  name: string;
  symbol: string;
  price: number;
  holdings: number;
}

interface PortfolioState {
  tokens: Token[];
}

const initialState: PortfolioState = {
  tokens: [],
};

const portfolioSlice = createSlice({
  name: "portfolio",
  initialState,
  reducers: {
    addToken: (state, action: PayloadAction<Token>) => {
      state.tokens.push(action.payload);
    },
    updateHoldings: (state, action: PayloadAction<{ id: string; holdings: number }>) => {
      const token = state.tokens.find(t => t.id === action.payload.id);
      if (token) token.holdings = action.payload.holdings;
    },
    removeToken: (state, action: PayloadAction<string>) => {
      state.tokens = state.tokens.filter(t => t.id !== action.payload);
    },
  },
});

export const { addToken, updateHoldings, removeToken } = portfolioSlice.actions;
export default portfolioSlice.reducer;
