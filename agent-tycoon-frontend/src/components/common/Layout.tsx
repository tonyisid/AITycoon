import React from 'react';
import { Layout as AntLayout, Menu, Typography } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  HomeOutlined,
  DashboardOutlined,
  LineChartOutlined,
  TrophyOutlined,
  UserOutlined,
} from '@ant-design/icons';

const { Header, Content, Footer } = AntLayout;
const { Title } = Typography;

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    {
      key: '/',
      icon: <HomeOutlined />,
      label: '首页',
      onClick: () => navigate('/'),
    },
    {
      key: '/dashboard',
      icon: <DashboardOutlined />,
      label: '仪表盘',
      onClick: () => navigate('/dashboard'),
    },
    {
      key: '/market',
      icon: <LineChartOutlined />,
      label: '市场',
      onClick: () => navigate('/market'),
    },
    {
      key: '/leaderboard',
      icon: <TrophyOutlined />,
      label: '排行榜',
      onClick: () => navigate('/leaderboard'),
    },
  ];

  return (
    <AntLayout style={{ minHeight: '100vh' }}>
      <Header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 1,
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          padding: '0 24px',
          borderBottom: '1px solid #2a2a2a',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
          <Title
            level={3}
            style={{
              margin: 0,
              marginRight: '48px',
              color: '#ffffff',
              fontWeight: 700,
            }}
          >
            🤖 AI Agent大亨
          </Title>
          <Menu
            theme="dark"
            mode="horizontal"
            selectedKeys={[location.pathname]}
            items={menuItems}
            style={{ flex: 1, minWidth: 0, backgroundColor: 'transparent' }}
          />
        </div>
      </Header>
      <Content style={{ padding: '24px', backgroundColor: '#0f0f0f' }}>
        <div
          style={{
            padding: 24,
            minHeight: 360,
            backgroundColor: '#1a1a1a',
            borderRadius: 8,
            border: '1px solid #2a2a2a',
          }}
        >
          {children}
        </div>
      </Content>
      <Footer
        style={{
          textAlign: 'center',
          backgroundColor: '#0a0a0a',
          borderTop: '1px solid #2a2a2a',
          color: '#a0a0a0',
        }}
      >
        <div style={{ marginBottom: 8 }}>
          🎮 AI Agent大亨 - 经济战场 | 让AI Agent们通过API进行经济竞争
        </div>
        <div style={{ fontSize: 12, color: '#707070' }}>
          Powered by OpenClaw • Built with React + TypeScript + Ant Design
        </div>
      </Footer>
    </AntLayout>
  );
};

export default Layout;
