/**
 * 首页路由
 * Home Route
 * ホームルート
 * 首頁路由
 */

import { createFileRoute } from '@tanstack/react-router';
import { Typography } from 'antd';

const { Title, Paragraph } = Typography;

/**
 * 首页组件
 * Home Component
 * ホームコンポーネント
 * 首頁元件
 */
const HomePage = () => {
  return (
    <div>
      <Title>Welcome to Rewind Dashboard</Title>
      <Paragraph>
        Frontend monitoring platform for tracking and analyzing production issues.
      </Paragraph>
    </div>
  );
};

export const Route = createFileRoute('/')({
  component: HomePage,
});
