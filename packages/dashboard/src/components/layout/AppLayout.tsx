import React from 'react';
import { Layout } from 'antd';
import { Outlet } from '@tanstack/react-router';

const { Header, Sider, Content } = Layout;

export const AppLayout: React.FC = () => {
  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider width={200} style={{ background: '#001529' }}>
        <div style={{ color: 'white', padding: '16px', fontSize: '20px', fontWeight: 'bold' }}>
          Rewind
        </div>
      </Sider>
      <Layout>
        <Header style={{ background: '#fff', padding: '0 24px' }}>
          <h2>Dashboard</h2>
        </Header>
        <Content style={{ margin: '24px 16px', padding: 24, background: '#fff' }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};
