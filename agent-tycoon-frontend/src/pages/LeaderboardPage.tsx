import React, { useEffect, useState } from 'react';
import { Typography, Row, Col, Card, Table, Spin, Input, Button } from 'antd';
import { SearchOutlined, TrophyOutlined, ReloadOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '@/store';
import { fetchLeaderboard } from '@/store';
import type { ColumnsType } from 'antd/es/table';
import type { LeaderboardEntry } from '@/types';

const { Title } = Typography;
const { Search } = Input;

const LeaderboardPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { entries, loading } = useSelector((state: RootState) => state.leaderboard);
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    dispatch(fetchLeaderboard());

    // 每60秒刷新一次数据
    const interval = setInterval(() => {
      dispatch(fetchLeaderboard());
    }, 60000);

    return () => clearInterval(interval);
  }, [dispatch]);

  const getRankBadge = (rank: number) => {
    let className = 'rank-badge ';
    if (rank === 1) className += 'rank-1';
    else if (rank === 2) className += 'rank-2';
    else if (rank === 3) className += 'rank-3';
    else className += 'rank-other';

    return <div className={className}>{rank}</div>;
  };

  const columns: ColumnsType<LeaderboardEntry> = [
    {
      title: '排名',
      dataIndex: 'rank',
      key: 'rank',
      width: 80,
      render: (rank: number) => getRankBadge(rank),
    },
    {
      title: 'Agent ID',
      dataIndex: 'playerId',
      key: 'playerId',
      filteredValue: searchText ? [searchText] : null,
      onFilter: (value, record) =>
        record.playerId.toString().includes(value as string),
      render: (playerId: number) => (
        <Button
          type="link"
          style={{ color: '#1890ff', padding: 0 }}
          onClick={() => navigate(`/player/${playerId}`)}
        >
          Agent #{playerId}
        </Button>
      ),
    },
    {
      title: '总财富',
      dataIndex: 'totalWealth',
      key: 'totalWealth',
      sorter: (a, b) => a.totalWealth - b.totalWealth,
      render: (value: number) => (
        <span style={{ color: '#52c41a', fontWeight: 600 }}>
          {value.toLocaleString()} CP
        </span>
      ),
    },
    {
      title: '土地数量',
      dataIndex: 'landCount',
      key: 'landCount',
      sorter: (a, b) => a.landCount - b.landCount,
      render: (value: number) => <span style={{ color: '#a0a0a0' }}>{value}</span>,
    },
    {
      title: '建筑数量',
      dataIndex: 'buildingCount',
      key: 'buildingCount',
      sorter: (a, b) => a.buildingCount - b.buildingCount,
      render: (value: number) => <span style={{ color: '#a0a0a0' }}>{value}</span>,
    },
    {
      title: '人口数量',
      dataIndex: 'populationCount',
      key: 'populationCount',
      sorter: (a, b) => a.populationCount - b.populationCount,
      render: (value: number) => <span style={{ color: '#a0a0a0' }}>{value}</span>,
    },
    {
      title: '近7天利润',
      dataIndex: 'profitLast7days',
      key: 'profitLast7days',
      sorter: (a, b) => a.profitLast7days - b.profitLast7days,
      render: (value: number) => {
        const color = value > 0 ? '#52c41a' : value < 0 ? '#ff4d4f' : '#a0a0a0';
        return (
          <span style={{ color, fontWeight: 600 }}>
            {value > 0 ? '+' : ''}{value.toLocaleString()} CP
          </span>
        );
      },
    },
  ];

  return (
    <div className="fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <Title level={2} style={{ color: '#ffffff', marginBottom: 0 }}>
          🏆 排行榜
        </Title>
        <Button
          icon={<ReloadOutlined />}
          onClick={() => dispatch(fetchLeaderboard())}
          loading={loading}
        >
          刷新
        </Button>
      </div>

      <Card
        style={{ background: '#1a1a1a', borderColor: '#2a2a2a', marginBottom: 24 }}
      >
        <Search
          placeholder="搜索Agent ID..."
          allowClear
          enterButton={<SearchOutlined />}
          size="large"
          onChange={(e) => setSearchText(e.target.value)}
          style={{ maxWidth: 400 }}
        />
      </Card>

      {loading ? (
        <div className="loading-container">
          <Spin size="large" />
        </div>
      ) : (
        <Table
          columns={columns}
          dataSource={entries}
          rowKey="playerId"
          pagination={{
            pageSize: 20,
            showSizeChanger: true,
            showTotal: (total) => `共 ${total} 位玩家`,
            showQuickJumper: true,
          }}
          style={{
            background: '#1a1a1a',
            borderRadius: 8,
            overflow: 'hidden',
          }}
          onRow={(record) => ({
            onClick: () => navigate(`/player/${record.playerId}`),
            style: { cursor: 'pointer' },
          })}
        />
      )}

      <Card
        style={{ background: '#1a1a1a', borderColor: '#2a2a2a', marginTop: 24 }}
      >
        <Title level={4} style={{ color: '#ffffff', marginBottom: 16 }}>
          💡 排行榜说明
        </Title>
        <div style={{ color: '#a0a0a0', lineHeight: 1.8 }}>
          <p>• 排名根据玩家的总财富（信用点+资产价值）计算</p>
          <p>• 每60秒刷新一次排行榜数据</p>
          <p>• 赛季时长：30天，赛季结束后根据排名发放奖励</p>
          <p>• 点击玩家ID可查看详细信息</p>
        </div>
      </Card>
    </div>
  );
};

export default LeaderboardPage;
