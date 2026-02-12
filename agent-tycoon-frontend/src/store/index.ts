import { configureStore, createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { Player, Land, MarketPrice, LeaderboardEntry, DashboardStats } from '@/types';
import apiClient from '@/services/api';

// ==================== 异步Action ====================

// 获取仪表盘数据
export const fetchDashboardStats = createAsyncThunk(
  'dashboard/fetchStats',
  async () => {
    return await apiClient.getDashboardStats();
  }
);

// 获取市场价格
export const fetchMarketPrices = createAsyncThunk(
  'market/fetchPrices',
  async () => {
    return await apiClient.getMarketPrices();
  }
);

// 获取排行榜
export const fetchLeaderboard = createAsyncThunk(
  'leaderboard/fetch',
  async (season?: number) => {
    return await apiClient.getLeaderboard(season);
  }
);

// 获取玩家列表
export const fetchPlayers = createAsyncThunk(
  'players/fetch',
  async ({ page = 1, pageSize = 20 }: { page?: number; pageSize?: number } = {}) => {
    return await apiClient.getPlayers(page, pageSize);
  }
);

// 获取土地列表
export const fetchLands = createAsyncThunk(
  'lands/fetch',
  async (params?: { landType?: string; minLocation?: number; maxLocation?: number }) => {
    return await apiClient.getLands(params);
  }
);

// ==================== Dashboard Slice ====================

interface DashboardState {
  stats: DashboardStats | null;
  loading: boolean;
  error: string | null;
}

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState: {
    stats: null,
    loading: false,
    error: null,
  } as DashboardState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboardStats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDashboardStats.fulfilled, (state, action) => {
        state.loading = false;
        state.stats = action.payload;
      })
      .addCase(fetchDashboardStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch dashboard stats';
      });
  },
});

// ==================== Market Slice ====================

interface MarketState {
  prices: MarketPrice[];
  loading: boolean;
  error: string | null;
  lastUpdated: Date | null;
}

const marketSlice = createSlice({
  name: 'market',
  initialState: {
    prices: [],
    loading: false,
    error: null,
    lastUpdated: null as Date | null,
  } as MarketState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchMarketPrices.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMarketPrices.fulfilled, (state, action) => {
        state.loading = false;
        state.prices = action.payload;
        state.lastUpdated = new Date();
      })
      .addCase(fetchMarketPrices.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch market prices';
      });
  },
});

// ==================== Leaderboard Slice ====================

interface LeaderboardState {
  entries: LeaderboardEntry[];
  loading: boolean;
  error: string | null;
}

const leaderboardSlice = createSlice({
  name: 'leaderboard',
  initialState: {
    entries: [],
    loading: false,
    error: null,
  } as LeaderboardState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchLeaderboard.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchLeaderboard.fulfilled, (state, action) => {
        state.loading = false;
        state.entries = action.payload;
      })
      .addCase(fetchLeaderboard.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch leaderboard';
      });
  },
});

// ==================== Players Slice ====================

interface PlayersState {
  players: Player[];
  loading: boolean;
  error: string | null;
  pagination: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
}

const playersSlice = createSlice({
  name: 'players',
  initialState: {
    players: [],
    loading: false,
    error: null,
    pagination: {
      total: 0,
      page: 1,
      pageSize: 20,
      totalPages: 0,
    },
  } as PlayersState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchPlayers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPlayers.fulfilled, (state, action) => {
        state.loading = false;
        state.players = action.payload.items;
        state.pagination = {
          total: action.payload.total,
          page: action.payload.page,
          pageSize: action.payload.pageSize,
          totalPages: action.payload.totalPages,
        };
      })
      .addCase(fetchPlayers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch players';
      });
  },
});

// ==================== Lands Slice ====================

interface LandsState {
  lands: Land[];
  loading: boolean;
  error: string | null;
}

const landsSlice = createSlice({
  name: 'lands',
  initialState: {
    lands: [],
    loading: false,
    error: null,
  } as LandsState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchLands.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchLands.fulfilled, (state, action) => {
        state.loading = false;
        state.lands = action.payload.items;
      })
      .addCase(fetchLands.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch lands';
      });
  },
});

// ==================== Store配置 ====================

export const store = configureStore({
  reducer: {
    dashboard: dashboardSlice.reducer,
    market: marketSlice.reducer,
    leaderboard: leaderboardSlice.reducer,
    players: playersSlice.reducer,
    lands: landsSlice.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
});

// 导出类型
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
