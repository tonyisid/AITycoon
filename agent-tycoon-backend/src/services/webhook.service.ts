/**
 * Webhook Notification Service
 * 发送事件通知到注册的webhook端点
 */

import { logger } from '../utils/logger';
import axios from 'axios';

export interface WebhookEvent {
  eventType: WebhookEventType;
  playerId: number;
  agentId: string;
  timestamp: Date;
  data: any;
}

export type WebhookEventType =
  | 'building_completed'
  | 'building_upgraded'
  | 'production_completed'
  | 'wage_paid'
  | 'loan_due'
  | 'loan_granted'
  | 'population_changed'
  | 'market_price_changed'
  | 'leaderboard_updated'
  | 'bankruptcy_warning'
  | 'auction_started'
  | 'auction_ended'
  | 'season_ended'
  | 'achievement_unlocked';

class WebhookService {
  private queue: Map<number, WebhookEvent[]> = new Map();
  private processing: boolean = false;

  /**
   * 添加webhook事件到队列
   */
  async queueEvent(event: WebhookEvent): Promise<void> {
    const { playerId } = event;

    if (!this.queue.has(playerId)) {
      this.queue.set(playerId, []);
    }

    this.queue.get(playerId)!.push(event);

    logger.info(`Webhook event queued: ${event.eventType} for player ${playerId}`);
  }

  /**
   * 处理单个玩家的webhook队列
   */
  private async processPlayerQueue(playerId: number): Promise<void> {
    const events = this.queue.get(playerId);
    if (!events || events.length === 0) return;

    // 从数据库获取玩家的webhook URL
    // TODO: 实现数据库查询
    const webhookUrl = await this.getPlayerWebhookUrl(playerId);

    if (!webhookUrl) {
      logger.debug(`No webhook URL for player ${playerId}, skipping notifications`);
      this.queue.delete(playerId);
      return;
    }

    // 批量发送事件
    const payload = {
      timestamp: new Date().toISOString(),
      events: events,
    };

    try {
      const response = await axios.post(webhookUrl, payload, {
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'AgentTycoon-Webhook/1.0',
        },
        timeout: 5000, // 5秒超时
      });

      if (response.status >= 200 && response.status < 300) {
        logger.info(`Webhook sent successfully to player ${playerId}: ${events.length} events`);
        this.queue.delete(playerId);
      } else {
        logger.warn(`Webhook returned non-200 status: ${response.status}`);
      }
    } catch (error: any) {
      logger.error(`Failed to send webhook to player ${playerId}: ${error.message}`);

      // 如果是4xx错误，清除队列（无效URL）
      if (error.response && error.response.status >= 400 && error.response.status < 500) {
        logger.error(`Clearing webhook queue for player ${playerId} due to client error`);
        this.queue.delete(playerId);
      }
      // 如果是5xx或网络错误，保留队列下次重试
    }
  }

  /**
   * 处理所有待发送的webhook
   */
  async processWebhooks(): Promise<void> {
    if (this.processing) {
      logger.debug('Webhook processing already in progress, skipping');
      return;
    }

    this.processing = true;

    try {
      const playerIds = Array.from(this.queue.keys());

      if (playerIds.length === 0) {
        logger.debug('No webhooks to process');
        return;
      }

      logger.info(`Processing webhooks for ${playerIds.length} players`);

      // 并发处理所有玩家的webhook（最多10个并发）
      const batchSize = 10;
      for (let i = 0; i < playerIds.length; i += batchSize) {
        const batch = playerIds.slice(i, i + batchSize);
        await Promise.all(batch.map(playerId => this.processPlayerQueue(playerId)));
      }

      logger.info('Webhook processing completed');
    } catch (error: any) {
      logger.error(`Error processing webhooks: ${error.message}`);
    } finally {
      this.processing = false;
    }
  }

  /**
   * 从数据库获取玩家的webhook URL
   * TODO: 实现数据库查询
   */
  private async getPlayerWebhookUrl(playerId: number): Promise<string | null> {
    // 这里应该从数据库查询玩家的webhook_url字段
    // 暂时返回null，等待数据库集成
    return null;
  }

  /**
   * 获取当前队列状态
   */
  getQueueStatus(): { totalPlayers: number; totalEvents: number } {
    const totalPlayers = this.queue.size;
    const totalEvents = Array.from(this.queue.values()).reduce(
      (sum, events) => sum + events.length,
      0
    );

    return { totalPlayers, totalEvents };
  }
}

export const webhookService = new WebhookService();
