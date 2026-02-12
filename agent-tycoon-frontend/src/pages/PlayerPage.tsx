import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Typography, Row, Col, Card, Statistic, Spin, Descriptions, Button, Tag } from 'antd';
import {
  UserOutlined,
  DollarOutlined,
  HomeOutlined,
  BuildingOutlined,
  TeamOutlined,
  ArrowLeftOutlined,
} from '@ant-design/icons';
import { Player, Building, Population, Loan } from '@/types';
import apiClient from '@/services/api';

const { Title } = Typography;

const PlayerPage: React.FC = () => {
  const { playerId } = useParams<{ playerId: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [player, setPlayer] = useState<Player | null>(null);
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [population, setPopulation] = useState<Population | null>(null);
  const [loans, setLoans] = useState<Loan[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      if (!playerId) return;

      try {
        setLoading(true);

        // 并发获取所有数据
        const [playerData, buildingsData, populationData, loansData] = await Promise.all([
          apiClient.getPlayer(parseInt(playerId)),
          apiClient.getBuildings(parseInt(playerId)),
          apiClient.getPopulation(parseInt(playerId)),
          apiClient.getLoans(parseInt(playerId)),
        ]);

        setPlayer(playerData);
        setBuildings(buildingsData);
        setPopulation(populationData);
        setLoans(loansData);
      } catch (error) {
        console.error('Failed to fetch player data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [playerId]);

  const getCreditRatingColor = (rating: string) => {
    const colors: Record<string, string> = {
      A: '#52c41a',
      B: '#1890ff',
      C: '#faad14',
      D: '#ff4d4f',
    };
    return colors[rating] || '#a0a0a0';
  };

  if (loading) {
    return (
      <div className="loading-container">
        <Spin size="large" />
      </div>
    );
  }

  if (!player) {
    return (
      <div>
        <Title level={2}>玩家不存在</Title>
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)}>
          返回
        </Button>
      </div>
    );
  }

  return (
    <div className="fade-in">
      <Button
        icon={<ArrowLeftOutlined />}
        onClick={() => navigate(-1)}
        style={{ marginBottom: 16 }}
      >
        返回
      </Button>

      {/* 玩家基本信息 */}
      <Card
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <UserOutlined style={{ fontSize: 24, color: '#1890ff' }} />
            <span style={{ color: '#ffffff', fontSize: 20 }}>
              {player.agentName}
            </span>
            {player.isBankrupt && (
              <Tag color="error">已破产</Tag>
            )}
          </div>
        }
        bordered={false}
        style={{ background: '#1a1a1a', borderColor: '#2a2a2a', marginBottom: 24 }}
      >
        <Descriptions column={{ xs: 1, sm: 2, md: 3 }} bordered>
          <Descriptions.Item label="Agent ID">
            <span style={{ color: '#a0a0a0' }}>{player.agentId}</span>
          </Descriptions.Item>
          <Descriptions.Item label="信用评级">
            <span
              style={{
                color: getCreditRatingColor(player.creditRating),
                fontWeight: 600,
                fontSize: 16,
              }}
            >
              {player.creditRating} 级
            </span>
          </Descriptions.Item>
          <Descriptions.Item label="当前赛季">
            <span style={{ color: '#a0a0a0' }}>第 {player.currentSeason} 赛季</span>
          </Descriptions.Item>
          <Descriptions.Item label="信用点">
            <span style={{ color: '#52c41a', fontWeight: 600 }}>
              {player.creditPoints.toLocaleString()} CP
            </span>
          </Descriptions.Item>
          <Descriptions.Item label="总财富">
            <span style={{ color: '#faad14', fontWeight: 600 }}>
              {player.totalWealth.toLocaleString()} CP
            </span>
          </Descriptions.Item>
          <Descriptions.Item label="注册时间">
            <span style={{ color: '#a0a0a0' }}>
              {new Date(player.createdAt).toLocaleDateString('zh-CN')}
            </span>
          </Descriptions.Item>
        </Descriptions>
      </Card>

      {/* 统计数据 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} md={6}>
          <Card bordered={false} style={{ background: '#1a1a1a', borderColor: '#2a2a2a' }}>
            <Statistic
              title="建筑数量"
              value={buildings.length}
              prefix={<BuildingOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card bordered={false} style={{ background: '#1a1a1a', borderColor: '#2a2a2a' }}>
            <Statistic
              title="总人口"
              value={population?.totalPopulation || 0}
              prefix={<TeamOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card bordered={false} style={{ background: '#1a1a1a', borderColor: '#2a2a2a' }}>
            <Statistic
              title="在职人口"
              value={population?.employedPopulation || 0}
              prefix={<TeamOutlined />}
              valueStyle={{ color: '#13c2c2' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card bordered={false} style={{ background: '#1a1a1a', borderColor: '#2a2a2a' }}>
            <Statistic
              title="贷款数量"
              value={loans.filter(l => l.status === 'active').length}
              prefix={<DollarOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
      </Row>

      {/* 人口详情 */}
      {population && (
        <Card
          title="👥 人口信息"
          bordered={false}
          style={{ background: '#1a1a1a', borderColor: '#2a2a2a', marginBottom: 24 }}
        >
          <Row gutter={[16, 16]}>
            <Col xs={12} sm={8} md={6}>
              <div>
                <div style={{ color: '#a0a0a0', fontSize: 12, marginBottom: 4 }}>失业人口</div>
                <div style={{ color: '#ffffff', fontSize: 20, fontWeight: 600 }}>
                  {population.unemployedPopulation}
                </div>
              </div>
            </Col>
            <Col xs={12} sm={8} md={6}>
              <div>
                <div style={{ color: '#a0a0a0', fontSize: 12, marginBottom: 4 }}>满意度</div>
                <div style={{ color: '#ffffff', fontSize: 20, fontWeight: 600 }}>
                  {(population.satisfactionLevel * 100).toFixed(0)}%
                </div>
              </div>
            </Col>
            <Col xs={12} sm={8} md={6}>
              <div>
                <div style={{ color: '#a0a0a0', fontSize: 12, marginBottom: 4 }}>增长率</div>
                <div style={{ color: '#ffffff', fontSize: 20, fontWeight: 600 }}>
                  {(population.growthRate * 100).toFixed(2)}%
                </div>
              </div>
            </Col>
            <Col xs={12} sm={8} md={6}>
              <div>
                <div style={{ color: '#a0a0a0', fontSize: 12, marginBottom: 4 }}>日均消耗</div>
                <div style={{ color: '#ffffff', fontSize: 20, fontWeight: 600 }}>
                  {population.dailyFoodConsumption + population.dailyClothingConsumption} CP
                </div>
              </div>
            </Col>
          </Row>
        </Card>
      )}

      {/* 贷款信息 */}
      {loans.length > 0 && (
        <Card
          title="💳 贷款信息"
          bordered={false}
          style={{ background: '#1a1a1a', borderColor: '#2a2a2a' }}
        >
          <div style={{ color: '#a0a0a0' }}>
            {loans.map((loan) => (
              <div key={loan.loanId} style={{ marginBottom: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>
                    {loan.loanType} 贷款
                    <Tag color={loan.status === 'active' ? 'processing' : 'default'} style={{ marginLeft: 8 }}>
                      {loan.status}
                    </Tag>
                  </span>
                  <span style={{ color: '#faad14', fontWeight: 600 }}>
                    {loan.amount.toLocaleString()} CP
                  </span>
                </div>
                <div style={{ fontSize: 12, marginTop: 4 }}>
                  到期日: {new Date(loan.dueDate).toLocaleDateString('zh-CN')} |
                  已还: {loan.repaidAmount.toLocaleString()} CP
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};

export default PlayerPage;
