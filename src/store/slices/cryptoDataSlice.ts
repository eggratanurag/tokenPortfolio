import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { getCryptoData, getAllCryptoTokens, searchCryptoTokens, CryptoToken, TokenListItem } from "../../services/cryptoApi";

// Async thunk for fetching watchlist token data
// export const fetchWatchlistData = createAsyncThunk(
//   'cryptoData/fetchWatchlistData',
//   async (tokenIds: string[]) => {
//     const data = await getCryptoData(tokenIds);
//     return data;
//   }
// );


// Async thunk for fetching all tokens (for popup)
export const fetchAllTokens = createAsyncThunk(
  'cryptoData/fetchAllTokens',
  async (params?: { page?: number; perPage?: number }) => {
    const data = await getAllCryptoTokens(params?.page, params?.perPage);
    return data;
  }
);

// Async thunk for searching tokens
export const searchTokens = createAsyncThunk(
  'cryptoData/searchTokens',
  async (query: string) => {
    const data = await searchCryptoTokens(query);
    return data;
  }
);

interface CryptoDataState {
  watchlistData: CryptoToken[];
  allTokens: TokenListItem[];
  searchResults: TokenListItem[];
  loading: {
    watchlist: boolean;
    allTokens: boolean;
    search: boolean;
  };
  error: {
    watchlist: string | null;
    allTokens: string | null;
    search: string | null;
  };
}

const initialState: CryptoDataState = {
  watchlistData: [],
  allTokens: [],
  searchResults: [],
  loading: {
    watchlist: false,
    allTokens: false,
    search: false,
  },
  error: {
    watchlist: null,
    allTokens: null,
    search: null,
  },
};

const cryptoDataSlice = createSlice({
  name: "cryptoData",
  initialState,
  reducers: {
    clearSearchResults: (state) => {
      state.searchResults = [];
      state.error.search = null;
    },
    clearErrors: (state) => {
      state.error = {
        watchlist: null,
        allTokens: null,
        search: null,
      };
    },
    setAllTokens: (state, action: PayloadAction<TokenListItem[]>) => {
      state.allTokens = action.payload;
    },
    appendTokens: (state, action: PayloadAction<TokenListItem[]>) => {
      state.allTokens = [...state.allTokens, ...action.payload];
    },
  },
  extraReducers: (builder) => {
    // Fetch watchlist data
    builder
      // .addCase(fetchWatchlistData.pending, (state) => {
      //   state.loading.watchlist = true;
      //   state.error.watchlist = null;
      // })
      // .addCase(fetchWatchlistData.fulfilled, (state, action) => {
      //   state.loading.watchlist = false;
      //   state.watchlistData = action.payload;
      // })
      // .addCase(fetchWatchlistData.rejected, (state, action) => {
      //   state.loading.watchlist = false;
      //   state.error.watchlist = action.error.message || 'Failed to fetch watchlist data';
      // })
      
      // Fetch all tokens
      .addCase(fetchAllTokens.pending, (state) => {
        state.loading.allTokens = true;
        state.error.allTokens = null;
      })
      .addCase(fetchAllTokens.fulfilled, (state, action) => {
        state.loading.allTokens = false;
        state.allTokens = action.payload;
      })
      .addCase(fetchAllTokens.rejected, (state, action) => {
        state.loading.allTokens = false;
        state.error.allTokens = action.error.message || 'Failed to fetch tokens';
      })
      
      // Search tokens
      .addCase(searchTokens.pending, (state) => {
        state.loading.search = true;
        state.error.search = null;
      })
      .addCase(searchTokens.fulfilled, (state, action) => {
        state.loading.search = false;
        state.searchResults = action.payload;
      })
      .addCase(searchTokens.rejected, (state, action) => {
        state.loading.search = false;
        state.error.search = action.error.message || 'Search failed';
      });
  },
});

export const { clearSearchResults, clearErrors, setAllTokens, appendTokens } = cryptoDataSlice.actions;
export default cryptoDataSlice.reducer;