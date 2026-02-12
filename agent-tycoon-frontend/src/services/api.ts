import axios, { AxiosInstance, AxiosResponse } from 'axios';
import {
  ApiResponse,
  Player,
  Land,
  Building,
  Population,
  Loan,
  MarketPrice,
  Auction,
  LeaderboardEntry,
  PaginatedResponse,
  DashboardStats,
  MarketTrend,
} from '@/types';

// API基础配置
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // 请求拦截器
    this.client.interceptors.request.use(
      (config) => {
        // 可以在这里添加token
        const token = localStorage.getItem('token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // 响应拦截器
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        console.error('API Error:', error.response?.data || error.message);
        return Promise.reject(error);
      }
    );
  }

  // 通用请求方法
  private async request<T>(
    method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
    url: string,
    data?: any
  ): Promise<T> {
    try {
      const response: AxiosResponse<ApiResponse<T>> = await this.client.request({
        method,
        url,
        data,
      });
      return response.data.data;
    } catch (error) {
      throw error;
    }
  }

  // ==================== 认证相关 ====================

  // 登录
  async login(apiKey: string): Promise<{ token: string; player: Player }> {
    return this.request('POST', '/v1/auth/login', { apiKey });
  }

  // ==================== 玩家相关 ====================

  // 获取玩家信息
  async getPlayer(playerId: number): Promise<Player> {
    return this.request('GET', `/v1/players/${playerId}`);
  }

  // 获取玩家列表
  async getPlayers(page: number = 1, pageSize: number = 20): Promise<PaginatedResponse<Player>> {
    return this.request('GET', `/v1/players?page=${page}&pageSize=${pageSize}`);
  }

  // ==================== 土地相关 ====================

  // 获取可用土地列表
  async getLands(params?: {
    landType?: string;
    minLocation?: number;
    maxLocation?: number;
    page?: number;
    pageSize?: number;
  }): Promise<PaginatedResponse<Land>> {
    const query = new URLSearchParams(params as any).toString();
    return this.request('GET', `/v1/lands?${query}`);
  }

  // 获取土地详情
  async getLand(landId: string): Promise<Land> {
    return this.request('GET', `/v1/lands/${landId}`);
  }

  // ==================== 建筑相关 ====================

  // 获取玩家的建筑列表
  async getBuildings(playerId: number): Promise<Building[]> {
    return this.request('GET', `/v1/players/${playerId}/buildings`);
  }

  // 获取建筑详情
  async getBuilding(buildingId: string): Promise<Building> {
    return this.request('GET', `/v1/buildings/${buildingId}`);
  }

  // ==================== 人口相关 ====================

  // 获取玩家人口信息
  async getPopulation(playerId: number): Promise<Population> {
    return this.request('GET', `/v1/players/${playerId}/population`);
  }

  // ==================== 贷款相关 ====================

  // 获取玩家的贷款列表
  async getLoans(playerId: number): Promise<Loan[]> {
    return this.request('GET', `/v1/players/${playerId}/loans`);
  }

  // ==================== 市场相关 ====================

  // 获取所有市场价格
  async getMarketPrices(): Promise<MarketPrice[]> {
    return this.request('GET', '/v1/market/prices');
  }

  // 获取特定物品的市场价格
  async getMarketPrice(itemType: string): Promise<MarketPrice> {
    return this.request('GET', `/v1/market/prices/${itemType}`);
  }

  // 获取市场趋势数据
  async getMarketTrends(): Promise<MarketTrend[]> {
    return this.request('GET', '/v1/market/trends');
  }

  // ==================== 拍卖相关 ====================

  // 获取活跃的拍卖列表
  async getAuctions(status: string = 'active'): Promise<Auction[]> {
    return this.request('GET', `/v1/auctions?status=${status}`);
  }

  // 获取拍卖详情
  async getAuction(auctionId: string): Promise<Auction> {
    return this.request('GET', `/v1/auctions/${auctionId}`);
  }

  // ==================== 排行榜相关 ====================

  // 获取当前赛季排行榜
  async getLeaderboard(season?: number): Promise<LeaderboardEntry[]> {
    const url = season ? `/v1/leaderboard?season=${season}` : '/v1/leaderboard';
    return this.request('GET', url);
  }

  // ==================== 仪表盘相关 ====================

  // 获取仪表盘统计数据
  async getDashboardStats(): Promise<DashboardStats> {
    return this.request('GET', '/v1/dashboard/stats');
  }

  // ==================== 系统相关 ====================

  // 健康检查
  async healthCheck(): Promise<{ status: string; timestamp: string }> {
    return this.request('GET', '/health');
  }
}

// 导出单例
export const apiClient = new ApiClient();
export default apiClient;
