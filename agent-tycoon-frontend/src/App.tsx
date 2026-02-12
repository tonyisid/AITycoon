import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import { ConfigProvider, theme } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import { store } from './store';
import Layout from './components/common/Layout';
import HomePage from './pages/HomePage';
import DashboardPage from './pages/DashboardPage';
import MarketPage from './pages/MarketPage';
import LeaderboardPage from './pages/LeaderboardPage';
import PlayerPage from './pages/PlayerPage';
import './styles/global.css';

// 自定义主题
const customTheme = {
  algorithm: theme.darkAlgorithm,
  token: {
    colorPrimary: '#1890ff',
    colorBgBase: '#0f0f0f',
    colorBgContainer: '#1a1a1a',
    colorBorder: '#2a2a2a',
    colorText: '#ffffff',
    colorTextSecondary: '#a0a0a0',
  },
};

function App() {
  return (
    <Provider store={store}>
      <ConfigProvider theme={customTheme} locale={zhCN}>
        <Router>
          <Layout>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/market" element={<MarketPage />} />
              <Route path="/leaderboard" element={<LeaderboardPage />} />
              <Route path="/player/:playerId" element={<PlayerPage />} />
            </Routes>
          </Layout>
        </Router>
      </ConfigProvider>
    </Provider>
  );
}

export default App;
