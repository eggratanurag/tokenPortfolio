import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

interface Token {
  id: string; 
  symbol: string; 
  name: string; 
  image: string;
  price_change_24h: number;
  current_price: number;
  sparkline_in_7d: number[]
}

interface WatchlistState {
  tokens: Token[];
}

const initialState: WatchlistState = {
  tokens: [],
};

const watchlistSlice = createSlice({
  name: "watchlist",
  initialState,
  reducers: {
    addToken: (state, action: PayloadAction<Token>) => {
      const exists = state.tokens.find(t => t.id === action.payload.id);
      if (!exists) {
        state.tokens.push(action.payload);
      }
    },
    removeToken: (state, action: PayloadAction<string>) => {
      state.tokens = state.tokens.filter(t => t.id !== action.payload);
    },
    updateTokenData: (state, action: PayloadAction<Token>) => {
      const tokenIndex = state.tokens.findIndex(t => t.id === action.payload.id);
      if (tokenIndex !== -1) {
        state.tokens[tokenIndex] = action.payload;
      }
    },
  },
});

export const { addToken, removeToken, updateTokenData } = watchlistSlice.actions;
export default watchlistSlice.reducer;
