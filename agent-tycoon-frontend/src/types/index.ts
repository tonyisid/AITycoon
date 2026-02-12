// 玩家类型
export interface Player {
  id: number;
  agentId: string;
  agentName: string;
  creditPoints: number;
  creditRating: 'A' | 'B' | 'C' | 'D';
  currentSeason: number;
  totalWealth: number;
  isBankrupt: boolean;
  createdAt: string;
  updatedAt: string;
}

// 土地类型
export type LandType = 'commercial' | 'industrial' | 'agricultural' | 'tech' | 'residential';

export interface Land {
  id: number;
  landId: string;
  landType: LandType;
  area: number;
  location: number;
  powerCapacity: number;
  waterResource: number;
  transportAccess: number;
  policyRestriction: number;
  basePrice: number;
  currentOwnerId: number | null;
  isAvailable: boolean;
  createdAt: string;
  updatedAt: string;
}

// 建筑类型
export interface Building {
  id: number;
  buildingId: string;
  landId: number;
  ownerId: number;
  buildingType: string;
  buildingLevel: number;
  productionEfficiency: number;
  powerConsumption: number;
  workerCount: number;
  constructionStart: string | null;
  constructionEnd: string | null;
  upgradeStart: string | null;
  upgradeEnd: string | null;
  isOperational: boolean;
  dailyProduction: Record<string, number>;
  dailyConsumption: Record<string, number>;
  createdAt: string;
  updatedAt: string;
}

// 人口类型
export interface Population {
  id: number;
  playerId: number;
  totalPopulation: number;
  employedPopulation: number;
  unemployedPopulation: number;
  satisfactionLevel: number;
  growthRate: number;
  dailyFoodConsumption: number;
  dailyClothingConsumption: number;
  dailyHousingConsumption: number;
  dailyEntertainmentConsumption: number;
  createdAt: string;
  updatedAt: string;
}

// 贷款类型
export type LoanType = 'short' | 'medium' | 'long';
export type LoanStatus = 'active' | 'repaid' | 'defaulted' | 'cancelled';

export interface Loan {
  id: number;
  loanId: string;
  playerId: number;
  loanType: LoanType;
  amount: number;
  durationDays: number;
  dailyInterest: number;
  totalRepayment: number;
  dueDate: string;
  repaidAmount: number;
  status: LoanStatus;
  isOverdue: boolean;
  createdAt: string;
  updatedAt: string;
}

// 市场价格类型
export type PriceTrend = 'rising' | 'falling' | 'stable' | 'volatile';

export interface MarketPrice {
  id: number;
  itemType: string;
  basePrice: number;
  currentPrice: number;
  totalDemand: number;
  totalSupply: number;
  priceTrend: PriceTrend;
  marketSentiment: number;
  priceHistory: number[];
  updatedAt: string;
}

// 拍卖类型
export type AuctionStatus = 'pending' | 'active' | 'completed' | 'cancelled';
export type AuctionAssetType = 'land' | 'building';

export interface Auction {
  id: number;
  auctionId: string;
  playerId: number;
  assetType: AuctionAssetType;
  assetId: number;
  startingPrice: number;
  currentBid: number;
  highestBidderId: number | null;
  auctionStart: string;
  auctionEnd: string;
  auctionStatus: AuctionStatus;
  bids: Array<{
    playerId: number;
    amount: number;
    timestamp: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

// 排行榜类型
export interface LeaderboardEntry {
  id: number;
  season: number;
  playerId: number;
  rank: number;
  totalWealth: number;
  landCount: number;
  buildingCount: number;
  populationCount: number;
  profitLast7days: number;
  updatedAt: string;
}

// API响应类型
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

// 分页类型
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// 统计数据类型
export interface DashboardStats {
  totalPlayers: number;
  activePlayers: number;
  totalWealth: number;
  totalLands: number;
  totalBuildings: number;
  totalPopulation: number;
  averageWealth: number;
  topPlayer: Player;
}

// 市场趋势数据
export interface MarketTrend {
  itemType: string;
  prices: Array<{
    timestamp: string;
    price: number;
  }>;
  trend: PriceTrend;
  changePercent: number;
}
