import React, { useEffect } from 'react';
import { Typography, Row, Col, Card, Statistic, Spin } from 'antd';
import {
  UserOutlined,
  DollarOutlined,
  HomeOutlined,
  BuildOutlined,
  TeamOutlined,
} from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '@/store';
import { fetchDashboardStats } from '@/store';

const { Title } = Typography;

const DashboardPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { stats, loading } = useSelector((state: RootState) => state.dashboard);

  useEffect(() => {
    dispatch(fetchDashboardStats());

    // 每30秒刷新一次数据
    const interval = setInterval(() => {
      dispatch(fetchDashboardStats());
    }, 30000);

    return () => clearInterval(interval);
  }, [dispatch]);

  if (loading && !stats) {
    return (
      <div className="loading-container">
        <Spin size="large" />
      </div>
    );
  }

  if (!stats) {
    return (
      <div>
        <Title level={2}>仪表盘</Title>
        <p>无法加载数据</p>
      </div>
    );
  }

  return (
    <div className="fade-in">
      <Title level={2} style={{ color: '#ffffff', marginBottom: 24 }}>
        📊 游戏仪表盘
      </Title>

      {/* 关键指标 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} md={6}>
          <Card bordered={false} style={{ background: '#1a1a1a', borderColor: '#2a2a2a' }}>
            <Statistic
              title="总玩家数"
              value={stats.totalPlayers}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card bordered={false} style={{ background: '#1a1a1a', borderColor: '#2a2a2a' }}>
            <Statistic
              title="活跃玩家"
              value={stats.activePlayers}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card bordered={false} style={{ background: '#1a1a1a', borderColor: '#2a2a2a' }}>
            <Statistic
              title="总财富"
              value={stats.totalWealth}
              prefix={<DollarOutlined />}
              suffix="CP"
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card bordered={false} style={{ background: '#1a1a1a', borderColor: '#2a2a2a' }}>
            <Statistic
              title="平均财富"
              value={stats.averageWealth}
              prefix={<DollarOutlined />}
              suffix="CP"
              valueStyle={{ color: '#13c2c2' }}
            />
          </Card>
        </Col>
      </Row>

      {/* 资源统计 */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={8}>
          <Card bordered={false} style={{ background: '#1a1a1a', borderColor: '#2a2a2a' }}>
            <Statistic
              title="总土地数"
              value={stats.totalLands}
              prefix={<HomeOutlined />}
              valueStyle={{ color: '#eb2f96' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Card bordered={false} style={{ background: '#1a1a1a', borderColor: '#2a2a2a' }}>
            <Statistic
              title="总建筑数"
              value={stats.totalBuildings}
              prefix={<BuildOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Card bordered={false} style={{ background: '#1a1a1a', borderColor: '#2a2a2a' }}>
            <Statistic
              title="总人口数"
              value={stats.totalPopulation}
              prefix={<TeamOutlined />}
              valueStyle={{ color: '#13c2c2' }}
            />
          </Card>
        </Col>
      </Row>

      {/* 顶级玩家 */}
      {stats.topPlayer && (
        <Card
          title="🏆 当前第一名"
          bordered={false}
          style={{ background: '#1a1a1a', borderColor: '#2a2a2a', marginTop: 24 }}
        >
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12}>
              <div>
                <div style={{ color: '#a0a0a0', fontSize: 14, marginBottom: 4 }}>Agent名称</div>
                <div style={{ color: '#ffffff', fontSize: 18, fontWeight: 600 }}>
                  {stats.topPlayer.agentName}
                </div>
              </div>
            </Col>
            <Col xs={24} sm={12}>
              <div>
                <div style={{ color: '#a0a0a0', fontSize: 14, marginBottom: 4 }}>总财富</div>
                <div style={{ color: '#52c41a', fontSize: 18, fontWeight: 600 }}>
                  {stats.topPlayer.totalWealth.toLocaleString()} CP
                </div>
              </div>
            </Col>
            <Col xs={24} sm={12}>
              <div>
                <div style={{ color: '#a0a0a0', fontSize: 14, marginBottom: 4 }}>信用评级</div>
                <div style={{
                  color: stats.topPlayer.creditRating === 'A' ? '#52c41a' :
                         stats.topPlayer.creditRating === 'B' ? '#1890ff' :
                         stats.topPlayer.creditRating === 'C' ? '#faad14' : '#ff4d4f',
                  fontSize: 18,
                  fontWeight: 600
                }}>
                  {stats.topPlayer.creditRating} 级
                </div>
              </div>
            </Col>
            <Col xs={24} sm={12}>
              <div>
                <div style={{ color: '#a0a0a0', fontSize: 14, marginBottom: 4 }}>状态</div>
                <div style={{
                  color: stats.topPlayer.isBankrupt ? '#ff4d4f' : '#52c41a',
                  fontSize: 18,
                  fontWeight: 600
                }}>
                  {stats.topPlayer.isBankrupt ? '已破产' : '经营中'}
                </div>
              </div>
            </Col>
          </Row>
        </Card>
      )}
    </div>
  );
};

export default DashboardPage;
