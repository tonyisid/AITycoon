import React, { useEffect } from 'react';
import { Typography, Row, Col, Card, Table, Spin, Tag, Button } from 'antd';
import {
  ArrowUpOutlined,
  ArrowDownOutlined,
  MinusOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '@/store';
import { fetchMarketPrices } from '@/store';
import type { ColumnsType } from 'antd/es/table';
import type { MarketPrice } from '@/types';

const { Title } = Typography;

const MarketPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { prices, loading } = useSelector((state: RootState) => state.market);

  useEffect(() => {
    dispatch(fetchMarketPrices());

    // 每30秒刷新一次数据
    const interval = setInterval(() => {
      dispatch(fetchMarketPrices());
    }, 30000);

    return () => clearInterval(interval);
  }, [dispatch]);

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'rising':
        return <ArrowUpOutlined style={{ color: '#52c41a' }} />;
      case 'falling':
        return <ArrowDownOutlined style={{ color: '#ff4d4f' }} />;
      default:
        return <MinusOutlined style={{ color: '#a0a0a0' }} />;
    }
  };

  const getTrendTag = (trend: string) => {
    const config: Record<string, { color: string; text: string }> = {
      rising: { color: 'success', text: '上涨' },
      falling: { color: 'error', text: '下跌' },
      stable: { color: 'default', text: '稳定' },
      volatile: { color: 'warning', text: '波动' },
    };

    const { color, text } = config[trend] || config.stable;
    return <Tag color={color}>{text}</Tag>;
  };

  const columns: ColumnsType<MarketPrice> = [
    {
      title: '物品名称',
      dataIndex: 'itemType',
      key: 'itemType',
      render: (text: string) => <span style={{ color: '#ffffff' }}>{text}</span>,
    },
    {
      title: '基础价格',
      dataIndex: 'basePrice',
      key: 'basePrice',
      render: (value: number) => <span style={{ color: '#a0a0a0' }}>{value} CP</span>,
    },
    {
      title: '当前价格',
      dataIndex: 'currentPrice',
      key: 'currentPrice',
      render: (value: number, record: MarketPrice) => {
        const change = ((value - record.basePrice) / record.basePrice) * 100;
        const color = change > 0 ? '#52c41a' : change < 0 ? '#ff4d4f' : '#a0a0a0';
        return (
          <span style={{ color, fontWeight: 600 }}>
            {value} CP
            <span style={{ fontSize: 12, marginLeft: 8 }}>
              ({change > 0 ? '+' : ''}{change.toFixed(1)}%)
            </span>
          </span>
        );
      },
    },
    {
      title: '总需求',
      dataIndex: 'totalDemand',
      key: 'totalDemand',
      render: (value: number) => <span style={{ color: '#a0a0a0' }}>{value}</span>,
    },
    {
      title: '总供应',
      dataIndex: 'totalSupply',
      key: 'totalSupply',
      render: (value: number) => <span style={{ color: '#a0a0a0' }}>{value}</span>,
    },
    {
      title: '趋势',
      dataIndex: 'priceTrend',
      key: 'priceTrend',
      render: (trend: string) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {getTrendIcon(trend)}
          {getTrendTag(trend)}
        </div>
      ),
    },
    {
      title: '市场情绪',
      dataIndex: 'marketSentiment',
      key: 'marketSentiment',
      render: (value: number) => {
        const color = value > 1 ? '#52c41a' : value < 1 ? '#ff4d4f' : '#a0a0a0';
        const text = value > 1 ? '乐观' : value < 1 ? '悲观' : '中性';
        return <Tag color={color}>{text} ({value.toFixed(2)})</Tag>;
      },
    },
  ];

  return (
    <div className="fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <Title level={2} style={{ color: '#ffffff', marginBottom: 0 }}>
          📈 市场价格
        </Title>
        <Button
          icon={<ReloadOutlined />}
          onClick={() => dispatch(fetchMarketPrices())}
          loading={loading}
        >
          刷新
        </Button>
      </div>

      {loading ? (
        <div className="loading-container">
          <Spin size="large" />
        </div>
      ) : (
        <Table
          columns={columns}
          dataSource={prices}
          rowKey="itemType"
          pagination={false}
          style={{
            background: '#1a1a1a',
            borderRadius: 8,
            overflow: 'hidden',
          }}
        />
      )}

      <Card
        style={{ background: '#1a1a1a', borderColor: '#2a2a2a', marginTop: 24 }}
      >
        <Title level={4} style={{ color: '#ffffff', marginBottom: 16 }}>
          💡 市场说明
        </Title>
        <div style={{ color: '#a0a0a0', lineHeight: 1.8 }}>
          <p>• 价格由供需关系决定：需求 > 供应时价格上涨，需求 < 供应时价格下跌</p>
          <p>• 价格波动范围：正常情况下为 ±20%，极端情况下可达 ±50%</p>
          <p>• 市场情绪影响价格：乐观情绪会推高价格，悲观情绪会压低价格</p>
          <p>• 每30分钟更新一次市场价格，反映最新的供需变化</p>
        </div>
      </Card>
    </div>
  );
};

export default MarketPage;
