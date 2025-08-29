import * as React from "react"
import { ColumnDef, ColumnFiltersState, flexRender, getCoreRowModel, getFilteredRowModel, getPaginationRowModel, getSortedRowModel, SortingState, useReactTable, VisibilityState, } from "@tanstack/react-table"
import { MoreHorizontal, RefreshCw } from "lucide-react"
import { FaStar } from "react-icons/fa";
import { Button as StyledButton } from "@/components/reusableComponents/button"
import { Button } from "@/components/ui/button"
import { FaPlus } from "react-icons/fa6";
import { edit, remove } from "@/assets/export"

import TokenSelectorPopup from "@/components/reusableComponents/tokenPopup"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger, } from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, } from "@/components/ui/table"
import { useAppSelector, useAppDispatch } from '@/store/storeHooks';
import SparklineChart from './SparklineChart';
import HoldingsInput from "@/components/internalComponents/holdingsInput";
import { updateHoldings, addToken, removeToken as removePortfolioToken } from '@/store/slices/portfolioSlice';

import { updateTokenData, removeToken } from '@/store/slices/watchListSlice';

// Updated Token type to include all necessary fields
export type Token = {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  price_change_24h: number;
  sparkline_in_7d: number[]; // Changed to match the actual data structure
  holdings?: number; // Local holdings for user
}


export function DataTableDemo() {
  const dispatch = useAppDispatch();
  const data: Token[] = useAppSelector(state => state.watchList.tokens);
  const portfolioTokens = useAppSelector(state => state.portfolio.tokens);
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [isPopupOpen, setIsPopupOpen] = React.useState(false);
  const [editingHoldings, setEditingHoldings] = React.useState<Record<string, boolean>>({});
  const [isRefreshing, setIsRefreshing] = React.useState(false);
  const inputRefs = React.useRef<Record<string, React.RefObject<HTMLInputElement | null>>>({});

  // Refresh function to fetch updated data for all watchlist tokens
  const handleRefresh = React.useCallback(async () => {
    if (data.length === 0) return;
    
    setIsRefreshing(true);
    try {
      // Get all token IDs from watchlist
      const tokenIds = data.map((token: Token) => token.id);
      
      // Use the specific endpoint for multiple coin IDs to get only watchlist tokens
      const response = await fetch(`https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${tokenIds.join(',')}&order=market_cap_desc&per_page=250&page=1&sparkline=true&price_change_percentage=24h`);
      const updatedTokens = await response.json();
      
      // Update each token in the watchlist with new data
      updatedTokens.forEach((updatedToken: { 
        id: string; 
        symbol: string; 
        name: string; 
        image: string; 
        price_change_24h: number; 
        current_price: number; 
        sparkline_in_7d: { price: number[] } 
      }) => {
        dispatch(updateTokenData({
          id: updatedToken.id,
          symbol: updatedToken.symbol.toUpperCase(),
          name: updatedToken.name,
          image: updatedToken.image,
          price_change_24h: updatedToken.price_change_24h,
          current_price: updatedToken.current_price,
          sparkline_in_7d: updatedToken.sparkline_in_7d.price,
        }));
      });
    } catch (error) {
      console.error('Error refreshing token data:', error);
    } finally {
      setIsRefreshing(false);
    }
  }, [data, dispatch]);

  // Define columns inside component to access state
  const columns: ColumnDef<Token>[] = [
    {
      accessorKey: "token",
      header: "Token",
      cell: ({ row }) => {
        const token = row.original;
        return (
          <div className="flex items-center  gap-3">
            <div className="w-8 h-8 rounded-full">
              <img
                src={token.image}
                alt={token.name}
                className="w-8 h-8 rounded-full"
                onError={(e) => {
                  e.currentTarget.src = 'https://via.placeholder.com/32x32?text=?';
                }}
              />
            </div>
            <div className="flex flex-col ">
              <span className="font-medium text-white">{token.name}</span>
              <span className="text-sm text-gray-400">{token.symbol.toUpperCase()}</span>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "current_price",
      header: "Price",
      cell: ({ row }) => {
        const price = row.getValue("current_price") as number;
        return (
          <div className="font-medium text-[#A1A1AA]">
            ${price ? price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 6 }) : '0.00'}
          </div>
        );
      },
    },
    {
      accessorKey: "price_change_24h",
      header: "24hr%",
      cell: ({ row }) => {
        const change = row.getValue("price_change_24h") as number;
        const isPositive = change >= 0;
        return (
          <div className={`font-medium text-[#A1A1AA]`}>
            {isPositive ? '+' : ''}{change ? change.toFixed(2) : '0.00'}%
          </div>
        );
      },
    },
      {
    accessorKey: "sparkline",
    header: "Sparkline (7d)",
    cell: ({ row }) => {
      const token = row.original;
      return (
        <div className="w-20 h-12">
          <SparklineChart
            key={token.id} // Add key to prevent unnecessary re-renders
            data={token.sparkline_in_7d || []} 
            priceChange={token.price_change_24h || 0}
          />
        </div>
      );
    },
  },
    {
      accessorKey: "holdings",
      header: () => <div className="holdings-column-header">Holdings</div>,
      cell: ({ row }: { row: any }) => {
        const token = row.original;
        const tokenId = token.id;

        // Create ref for this token if it doesn't exist
        if (!inputRefs.current[tokenId]) {
          inputRefs.current[tokenId] = React.createRef<HTMLInputElement>();
        }

        const inputRef = inputRefs.current[tokenId];
        if (!inputRef) return null;
        
        return (
          <div className="w-48"> {/* Fixed width container */}
            <HoldingsInput
              key={`holdings-${tokenId}`}
              value={token.holdings || 0}
              onSave={handleHoldingsUpdate}
              tokenId={tokenId}
              isEditing={editingHoldings[tokenId] || false}
              setIsEditing={(editing) => setEditingHoldings(prev => ({ ...prev, [tokenId]: editing }))}
              inputRef={inputRef}
            />
          </div>
        );
      },
    },
    {
      accessorKey: "value",
      header: "Value",
      cell: ({ row }: { row: any }) => {
        const token = row.original;
        const holdings = token.holdings || 0;
        const price = token.current_price || 0;
        const value = holdings * price;

        return (
          <div className="font-medium">
            ${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        );
      },
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }: { row: any }) => {
        const token = row.original;

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-wolfGray" align="end">
              <DropdownMenuItem
                className="text-[#A1A1AA] cursor-pointer"
                onClick={() => {
                  // Focus on holdings input for this token
                  setEditingHoldings(prev => ({ ...prev, [token.id]: true }));
                  // Focus the input after state update
                  setTimeout(() => {
                    if (inputRefs.current[token.id]?.current) {
                      inputRefs.current[token.id].current?.focus();
                    }
                  }, 0);
                }}
              >
                <img src={edit} alt="edit" className="w-4 h-4" /> Edit Holdings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => {
                  dispatch(removeToken(token.id)); // Remove from watchlist
                  dispatch(removePortfolioToken(token.id)); // Remove from portfolio
                }}
                className="text-[#FDA4AF] cursor-pointer"
              >
               <img src={remove} alt="remove" className="w-4 h-4" /> Remove
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ];

  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = React.useState({})

  // Enhanced data with Redux holdings
  const enhancedData = React.useMemo(() => {
    return data.map(token => {
      const portfolioToken = portfolioTokens.find(pt => pt.id === token.id);
      return {
        ...token,
        holdings: portfolioToken?.holdings || 0
      };
    });
  }, [data, portfolioTokens]);

  // Initialize portfolio tokens for new watchlist tokens
  React.useEffect(() => {
    data.forEach(token => {
      const existingPortfolioToken = portfolioTokens.find(pt => pt.id === token.id);
      if (!existingPortfolioToken) {
        // Add new token to portfolio with 0 holdings
        dispatch(addToken({
          id: token.id,
          name: token.name,
          symbol: token.symbol,
          price: token.current_price || 0,
          holdings: 0
        }));
      }
    });
  }, [data, portfolioTokens, dispatch]);

  // Auto-fetch fresh data for watchlist tokens when component mounts or watchlist changes
  React.useEffect(() => {
    if (data.length > 0) {
      // Add a small delay to prevent immediate API call on mount
      const timer = setTimeout(() => {
        handleRefresh();
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [data.length]); // Only run when watchlist length changes, not on every data change

  // Handle holdings update - save to Redux
  const handleHoldingsUpdate = React.useCallback((tokenId: string, holdings: number) => {
    // Round holdings to 6 decimal places to avoid unnecessary precision
    const roundedHoldings = Math.round(holdings * 1000000) / 1000000;
    dispatch(updateHoldings({ id: tokenId, holdings: roundedHoldings }));
  }, [dispatch]);

  // Update columns to use the holdings handler
  const columnsWithHoldings = React.useMemo(() => {
    return columns.map(col => {
      if ('accessorKey' in col && col.accessorKey === 'holdings') {
        return {
          ...col,
          cell: ({ row }: { row: any }) => {
            const token = row.original;
            const tokenId = token.id;

            // Create ref for this token if it doesn't exist
            if (!inputRefs.current[tokenId]) {
              inputRefs.current[tokenId] = React.createRef<HTMLInputElement>();
            }

            const inputRef = inputRefs.current[tokenId];
            if (!inputRef) return null;
            
            return (
              <div className="w-48"> {/* Fixed width container */}
                <HoldingsInput
                  key={`holdings-${tokenId}`}
                  value={token.holdings || 0}
                  onSave={handleHoldingsUpdate}
                  tokenId={tokenId}
                  isEditing={editingHoldings[tokenId] || false}
                  setIsEditing={(editing) => setEditingHoldings(prev => ({ ...prev, [tokenId]: editing }))}
                  inputRef={inputRef}
                />
              </div>
            );
          }
        };
      }
      return col;
    });
  }, [handleHoldingsUpdate, editingHoldings, inputRefs]);

  const table = useReactTable({
    data: enhancedData,
    columns: columnsWithHoldings,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    initialState: {
      pagination: {
        pageSize: 10, // Show exactly 10 rows per page
      },
    },
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  })

  return (
    <div className="w-full ">
      <div className="flex items-center  pb-4">
        <div className='flex gap-2 w-full flex-1 items-center '>
          <FaStar className="text-neonGreen" style={{ fontSize: "22px" }} />
          <p className='font-[600] text-white text-2xl' >Watchlist</p>
        </div>
        <div className="flex items-center gap-[12px]" >
          <Button 
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="bg-wolfGray text-textSlateWhite h-[36px] shadow-[0px_0px_0px_1px_#00000014,0px_1px_2px_0px_#0000001F]"
          >
            <RefreshCw className={`h-4 w-4 text-graySubText ${isRefreshing ? 'animate-spin' : ''}`} />
            <span className="hidden sm:block ml-2">
              {isRefreshing ? 'Refreshing...' : 'Refresh Prices'}
            </span>
          </Button>
          
          <StyledButton className="ml-auto" onClick={() => setIsPopupOpen(true)}>
            <FaPlus style={{ fontSize: "15px" }} /> Add Token
          </StyledButton>
          <TokenSelectorPopup
            isOpen={isPopupOpen}
            onClose={() => setIsPopupOpen(false)}
          />
        </div>
      </div>
      <div className="rounded-md border border-[#FFFFFF14]">
        <Table className="pl-5 overflow-hidden">
          <TableHeader className=" bg-wolfGray ">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead className="pl-5 text-graySubText" key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody  >
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell className="pl-5 text-textSlateWhite text-start" key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No tokens in watchlist. Add some tokens to get started!
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-between space-x-2 py-4">
        <div className="text-muted-foreground text-sm">
          {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1}-{Math.min(
            (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
            table.getFilteredRowModel().rows.length
          )} of {table.getFilteredRowModel().rows.length} results
        </div>

        <div className="flex items-center space-x-2">
          <div className="text-muted-foreground text-sm mr-4">
            {table.getState().pagination.pageIndex + 1} of {table.getPageCount()} pages
          </div>

          <div className="flex items-center space-x-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className="h-8 px-3 text-xs"
            >
              Prev
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className="h-8 px-3 text-xs"
            >
              Next
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
