/**
 * 应用主布局
 * Application Main Layout
 * アプリケーションメインレイアウト
 * 應用主佈局
 */

import React from 'react';
import { Layout, Menu } from 'antd';
import { Outlet, Link, useLocation } from '@tanstack/react-router';
import {
  DashboardOutlined,
  BugOutlined,
  ThunderboltOutlined,
  BarChartOutlined,
  BulbOutlined,
  SettingOutlined,
  BellOutlined,
  RocketOutlined,
} from '@ant-design/icons';

const { Header, Sider, Content } = Layout;

/**
 * 应用主布局组件
 * Application Main Layout Component
 * アプリケーションメインレイアウトコンポーネント
 * 應用主佈局元件
 */
export const AppLayout: React.FC = () => {
  const location = useLocation();
  
  // 根据当前路径确定选中的菜单项
  const getSelectedKey = () => {
    const path = location.pathname;
    if (path === '/') return 'home';
    if (path.startsWith('/issues')) return 'issues';
    if (path.startsWith('/projects')) return 'projects';
    if (path.startsWith('/performance')) return 'performance';
    if (path.startsWith('/api-monitoring')) return 'api-monitoring';
    if (path.startsWith('/blank-screen')) return 'blank-screen';
    if (path.startsWith('/ai-analysis')) return 'ai-analysis';
    if (path.startsWith('/alerts')) return 'alerts';
    return 'home';
  };

  const menuItems = [
    {
      key: 'home',
      icon: <DashboardOutlined />,
      label: <Link to="/">项目总览</Link>,
    },
    {
      key: 'projects',
      icon: <DashboardOutlined />,
      label: <Link to="/projects">项目列表</Link>,
    },
    {
      key: 'issues',
      icon: <BugOutlined />,
      label: <Link to="/issues">问题管理</Link>,
    },
    {
      key: 'performance',
      icon: <RocketOutlined />,
      label: <Link to="/performance">性能分析</Link>,
    },
    {
      key: 'api-monitoring',
      icon: <ThunderboltOutlined />,
      label: <Link to="/api-monitoring">API 监控</Link>,
    },
    {
      key: 'blank-screen',
      icon: <BarChartOutlined />,
      label: <Link to="/blank-screen">白屏检测</Link>,
    },
    {
      key: 'ai-analysis',
      icon: <BulbOutlined />,
      label: <Link to="/ai-analysis">AI 分析</Link>,
    },
    {
      key: 'alerts',
      icon: <BellOutlined />,
      label: <Link to="/alerts">告警配置</Link>,
    },
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider width={220} style={{ background: '#001529' }}>
        <div
          style={{
            color: 'white',
            padding: '16px',
            fontSize: '20px',
            fontWeight: 'bold',
            textAlign: 'center',
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          }}
        >
          Rewind
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[getSelectedKey()]}
          items={menuItems}
          style={{ marginTop: '16px' }}
        />
      </Sider>
      <Layout>
        <Header
          style={{
            background: '#fff',
            padding: '0 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          }}
        >
          <h2 style={{ margin: 0 }}>前端智能监控平台</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <Link to="/login" style={{ color: '#1890ff' }}>
              登录
            </Link>
          </div>
        </Header>
        <Content style={{ margin: '24px 16px', padding: 24, background: '#fff', minHeight: 280 }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};
