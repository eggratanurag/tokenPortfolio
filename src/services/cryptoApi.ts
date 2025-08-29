import axios from 'axios';

const BASE_URL = 'https://api.coingecko.com/api/v3';

export interface CryptoToken {
  id: string;
  symbol: string;
  name: string;
  image: string;
  price_change_24h: number;
  current_price: number;
  sparkline_in_7d: {
    price: number[];
  }
}

export interface TokenListItem {
  id: string;
  symbol: string;
  name: string;
  image: string;
  price_change_24h: number;
  current_price: number;
  sparkline_in_7d: {
    price: number[];
  }
}

// Get list of all cryptocurrencies for the popup with pagination
export const getAllCryptoTokens = async (page: number = 1, perPage: number = 15): Promise<TokenListItem[]> => {
  try {
    const response = await axios.get(`${BASE_URL}/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=${perPage}&page=${page}&sparkline=true`);
    return response.data;
  } catch (error) {
    console.error('Error fetching crypto tokens:', error);
    throw error;
  }
};

// Get paginated tokens for infinite scroll
export const getPaginatedCryptoTokens = async (page: number, perPage: number = 15): Promise<TokenListItem[]> => {
  try {
    const response = await axios.get(`${BASE_URL}/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=${perPage}&page=${page}&sparkline=true`);
    return response.data;
  } catch (error) {
    console.error('Error fetching paginated crypto tokens:', error);
    throw error;
  }
};

// Get detailed data for watchlist tokens
export const getCryptoData = async (tokenIds: string[]): Promise<CryptoToken[]> => {
  if (tokenIds.length === 0) return [];
  
  try {
    const ids = tokenIds.join(',');
    const response = await axios.get(
      `${BASE_URL}/coins/markets?vs_currency=usd&ids=${ids}&order=market_cap_desc&per_page=250&page=1&sparkline=true&price_change_percentage=24h`
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching crypto data:', error);
    throw error;
  }
};

// Search tokens (for search functionality in popup)
export const searchCryptoTokens = async (query: string): Promise<TokenListItem[]> => {
  try {
    // First, search for coins to get their IDs
    const searchResponse = await axios.get(`${BASE_URL}/search?query=${query}`);
    const searchResults = searchResponse.data.coins.slice(0, 50); // Limit to 50 results
    
    if (searchResults.length === 0) return [];
    
    // Extract coin IDs from search results
    const coinIds = searchResults.map((coin: { id: string }) => coin.id);
    
    // Fetch detailed data for the searched coins including images and prices
    const detailedResponse = await axios.get(
      `${BASE_URL}/coins/markets?vs_currency=usd&ids=${coinIds.join(',')}&order=market_cap_desc&per_page=250&page=1&sparkline=true&price_change_percentage=24h`
    );
    
    return detailedResponse.data;
  } catch (error) {
    console.error('Error searching crypto tokens:', error);
    throw error;
  }
};
