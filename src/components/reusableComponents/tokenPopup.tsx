import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/storeHooks';
import { fetchAllTokens, searchTokens, clearSearchResults, appendTokens } from '@/store/slices/cryptoDataSlice';
import { addToken } from '@/store/slices/watchListSlice';
import { TokenListItem, getPaginatedCryptoTokens } from '@/services/cryptoApi';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import {Button} from '@/components/reusableComponents/button';

interface TokenSelectorPopupProps {
    isOpen: boolean;
    onClose: () => void;
}

// Memoized token row component
const TokenRowItem = React.memo(({ token, isInWatchlist, isSelected, onToggleSelection }: {
    token: TokenListItem; 
    isInWatchlist: boolean; 
    isSelected: boolean;
    onToggleSelection: (tokenId: string) => void;
}) => {

    const handleClick = useCallback(() => {
        if (!isInWatchlist) {
            onToggleSelection(token.id);
        }
    }, [token.id, isInWatchlist, onToggleSelection]);

    return (
        <div
            onClick={handleClick}
            className={`flex items-center p-3 mx-2 justify-between w-[calc(100%-16px)] cursor-pointer rounded-lg transition-colors ${
                isInWatchlist
                    ? 'opacity-50 cursor-not-allowed'
                    : isSelected
                        ? 'bg-[#A9E8510F]' // Selected state
                        : 'hover:bg-[#A9E8510F]' // Hover state
            }`}
        >
            {/* <div dangerouslySetInnerHTML={{__html: `<img src=x onerror="alert('XSS!')" />`}} ></div> */}
            <div className='flex items-center gap-2'>
                {token.image && (
                    <img
                        src={token.image}
                        alt={token.name}
                        className="w-8 h-8 rounded-full mr-3"
                        loading="lazy"
                    />
                )}
                <div className="flex-1">
                    <div className="font-medium">
                        {token.name} <span className='font-light'>{`(${token.symbol?.toUpperCase()})`}</span>
                    </div>
                </div>
            </div>
            <Checkbox
                checked={isInWatchlist || isSelected}
                disabled={isInWatchlist}
                className='rounded-full dark:data-[state=checked]:bg-neonGreen dark:data-[state=checked]:border-neonGreen'
            />
        </div>
    );
});

TokenRowItem.displayName = 'TokenRowItem';

const TokenSelectorPopup: React.FC<TokenSelectorPopupProps> = ({ isOpen, onClose }) => {
    const dispatch = useAppDispatch();
    const { allTokens, searchResults, loading, error } = useAppSelector(state => state.cryptoData);
    const { tokens: watchlistTokens } = useAppSelector(state => state.watchList);

    const [searchQuery, setSearchQuery] = useState('');
    const [debouncedQuery, setDebouncedQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [hasMoreTokens, setHasMoreTokens] = useState(true);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    
    // Local state for selected tokens before adding to watchlist
    const [selectedTokens, setSelectedTokens] = useState<Set<string>>(new Set());
    
    // Scroll position preservation
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const scrollPositionRef = useRef(0);

    // Debounce search query
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedQuery(searchQuery);
        }, 300);

        return () => clearTimeout(timer);
    }, [searchQuery]);

    // Search when debounced query changes
    useEffect(() => {
        if (debouncedQuery.length > 2) {
            dispatch(searchTokens(debouncedQuery));
        } else if (debouncedQuery.length === 0) {
            dispatch(clearSearchResults());
        }
    }, [debouncedQuery, dispatch]);

    // Load all tokens when popup opens
    useEffect(() => {
        if (isOpen && (!allTokens || allTokens.length === 0)) {
            dispatch(fetchAllTokens({ page: 1, perPage: 50 }));
        }
    }, [isOpen, allTokens, dispatch]);

    // Load more tokens function for infinite scroll
    const loadMoreTokens = useCallback(async () => {
        if (isLoadingMore || !hasMoreTokens || searchQuery.length > 2) return;
        
        setIsLoadingMore(true);
        
        try {
            const nextPage = currentPage + 1;
            const newTokens = await getPaginatedCryptoTokens(nextPage, 50);
            
            if (newTokens.length > 0) {
                // Preserve scroll position before adding new tokens
                if (scrollContainerRef.current) {
                    scrollPositionRef.current = scrollContainerRef.current.scrollTop;
                }
                
                dispatch(appendTokens(newTokens));
                setCurrentPage(nextPage);
                
                // Restore scroll position after a brief delay
                setTimeout(() => {
                    if (scrollContainerRef.current && scrollPositionRef.current > 0) {
                        scrollContainerRef.current.scrollTop = scrollPositionRef.current;
                    }
                }, 50);
            } else {
                setHasMoreTokens(false);
            }
        } catch (error) {
            console.error('Error loading more tokens:', error);
        } finally {
            setIsLoadingMore(false);
        }
    }, [currentPage, hasMoreTokens, isLoadingMore, searchQuery, dispatch]);

    // Reset pagination when popup opens or search changes
    useEffect(() => {
        if (isOpen) {
            setCurrentPage(1);
            setHasMoreTokens(true);
            setIsLoadingMore(false);
            scrollPositionRef.current = 0;
            setSelectedTokens(new Set()); // Reset selected tokens
        }
    }, [isOpen]);

    useEffect(() => {
        if (searchQuery.length > 2) {
            setCurrentPage(1);
            setHasMoreTokens(true);
            scrollPositionRef.current = 0;
        }
    }, [searchQuery]);

    // Memoize watchlist token IDs for faster lookups
    const watchlistTokenIds = useMemo(() => {
        return new Set((watchlistTokens || []).map(token => token.id));
    }, [watchlistTokens]);

    // Memoize filtered tokens with safety checks
    const filteredTokens = useMemo(() => {
        const tokensToShow = searchQuery.length > 2 
            ? (searchResults || []) 
            : (allTokens || []);
        
        // Ensure we always return a valid array
        if (!Array.isArray(tokensToShow) || tokensToShow.length === 0) {
            return [];
        }
        
        // Filter out any invalid tokens
        return tokensToShow.filter(token => 
            token && 
            token.id && 
            token.symbol && 
            token.name
        );
    }, [searchResults, allTokens, searchQuery]);

    // Handle token selection/deselection
    const handleToggleSelection = useCallback((tokenId: string) => {
        setSelectedTokens(prev => {
            const newSet = new Set(prev);
            if (newSet.has(tokenId)) {
                newSet.delete(tokenId);
            } else {
                newSet.add(tokenId);
            }
            return newSet;
        });
    }, []);

    // Add selected tokens to watchlist
    const handleAddToWatchlist = useCallback(() => {
        const tokensToAdd = filteredTokens.filter(token => 
            selectedTokens.has(token.id) && 
            !watchlistTokenIds.has(token.id)
        );

        tokensToAdd.forEach(token => {
            if (token?.id && token?.symbol && token?.name) {
                dispatch(addToken({
                    id: token.id,
                    symbol: token.symbol.toUpperCase(),
                    name: token.name,
                    image: token.image,
                    price_change_24h: token.price_change_24h,
                    current_price: token.current_price,
                    sparkline_in_7d: token.sparkline_in_7d.price,
                }));
            }
        });

        // Clear selection and close popup
        setSelectedTokens(new Set());
        onClose();
    }, [selectedTokens, filteredTokens, watchlistTokenIds, dispatch, onClose]);

    const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value);
    }, []);

    // Handle scroll events for infinite loading
    const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
        const target = e.currentTarget;
        const scrollTop = target.scrollTop;
        const scrollHeight = target.scrollHeight;
        const clientHeight = target.clientHeight;
        
        // Save scroll position
        scrollPositionRef.current = scrollTop;
        
        // Check if we're near the bottom to load more tokens
        if (scrollTop + clientHeight >= scrollHeight - 200 && hasMoreTokens && !isLoadingMore) {
            loadMoreTokens();
        }
    }, [hasMoreTokens, isLoadingMore, loadMoreTokens]);

    // Only show the list if we have valid data
    const shouldShowList = !loading.allTokens && 
                          !loading.search && 
                          filteredTokens && 
                          Array.isArray(filteredTokens) &&
                          filteredTokens.length > 0;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}  >
            <DialogContent className="w-full max-w-[90%] sm:!max-w-[650px] p-0 bg-wolfDarkGray overflow-hidden">
                
                <DialogHeader className="sr-only">
                    <DialogTitle>Select Token</DialogTitle>
                </DialogHeader>
                
                {/* Search Input */}
                <div className=" border-b-1 border-[#FFFFFF14]">
                    <Input
                        type="text"
                        placeholder="Search tokens (e.g., ETH, SOL)..."
                        value={searchQuery}
                        onChange={handleInputChange}
                        className="w-full h-[52px] shadow-none border-none focus:ring-0 rounded-none !bg-wolfDarkGray"
                        autoFocus
                    />
                </div>

                {/* Loading State */}
                {(loading.allTokens || loading.search) && (
                    <div className="text-center py-4 h-[350px] flex items-center justify-center">
                        <div>Loading tokens...</div>
                    </div>
                )}

                {/* Error State */}
                {(error.allTokens || error.search) && (
                    <div className="text-red-500 text-center py-4 h-[350px] flex items-center justify-center">
                        <div>{error.allTokens || error.search}</div>
                    </div>
                )}
                <p className='pl-5 text-[12px] text-[#71717A]' >Trending</p>

                {/* Custom Infinite Scroll List */}
                {shouldShowList && (
                    <div 
                        ref={scrollContainerRef}
                        className="h-96 overflow-y-auto max-h-[350px] flex flex-col gap-[1px] custom-scrollbar"
                        onScroll={handleScroll}
                    >
                                                 {filteredTokens.map((token) => {
                             const isInWatchlist = watchlistTokenIds.has(token.id);
                             const isSelected = selectedTokens.has(token.id);
                             return (
                                 <TokenRowItem
                                     key={token.id}
                                     token={token}
                                     isInWatchlist={isInWatchlist}
                                     isSelected={isSelected}
                                     onToggleSelection={handleToggleSelection}
                                 />
                             );
                         })}
                        
                        {/* Loading more indicator */}
                        {isLoadingMore && (
                            <div className="text-center py-4 text-gray-500 border-t border-[#FFFFFF14]">
                                <div>Loading more tokens...</div>
                            </div>
                        )}
                        
                        {/* End of list indicator */}
                        {!hasMoreTokens && filteredTokens.length > 0 && (
                            <div className="text-center py-4 text-gray-500 border-t border-[#FFFFFF14]">
                                <div>No more tokens to load</div>
                            </div>
                        )}
                    </div>
                )}

                {/* Empty State */}
                {!shouldShowList && !loading.allTokens && !loading.search && (
                    <div className="text-center py-4 text-gray-500 h-[350px] flex items-center justify-center">
                        <div>{searchQuery ? 'No tokens found' : 'No tokens available'}</div>
                    </div>
                )}

                <DialogFooter className='border-t-1 py-[12px] px-[16px] border-[#FFFFFF14]'>
                    <Button 
                        onClick={handleAddToWatchlist}
                        disabled={selectedTokens.size === 0}
                        className='w-fit ml-auto '
                    >
                        {selectedTokens.size === 0 
                            ? 'Add to Watchlist' 
                            : `Add ${selectedTokens.size} token${selectedTokens.size === 1 ? '' : 's'} to Watchlist`
                        }
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default TokenSelectorPopup;