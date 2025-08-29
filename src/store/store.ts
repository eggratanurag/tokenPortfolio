import { configureStore } from "@reduxjs/toolkit";
import { persistStore, persistReducer, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from 'redux-persist';
import storage from 'redux-persist/lib/storage'; // localStorage
import { combineReducers } from '@reduxjs/toolkit';

import portfolioReducer from "./slices/portfolioSlice";
import watchListReducer from "./slices/watchListSlice";
import cryptoDataReducer from "./slices/cryptoDataSlice";

const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['watchList', 'portfolio'], // Only persist these slices
};

const rootReducer = combineReducers({
  portfolio: portfolioReducer,
  watchList: watchListReducer,
  cryptoData: cryptoDataReducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

export const persistor = persistStore(store);
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;