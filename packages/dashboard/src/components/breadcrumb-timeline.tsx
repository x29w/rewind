/**
 * 行为轨迹时间线组件
 * Breadcrumb Timeline Component
 * ブレッドクラムタイムラインコンポーネント
 * 行為軌跡時間線元件
 */

import React from 'react';
import { Timeline, Tag, Typography } from 'antd';
import {
  ClickOutlined,
  EditOutlined,
  ApiOutlined,
  CompassOutlined,
  BugOutlined,
  InfoCircleOutlined,
} from '@ant-design/icons';

const { Text } = Typography;

interface Breadcrumb {
  type: string;
  category: string;
  message: string;
  data?: any;
  timestamp: number;
}

interface BreadcrumbTimelineProps {
  breadcrumbs: Breadcrumb[];
  errorTimestamp?: number;
}

export const BreadcrumbTimeline: React.FC<BreadcrumbTimelineProps> = ({
  breadcrumbs,
  errorTimestamp,
}) => {
  const getIcon = (category: string) => {
    switch (category) {
      case 'click':
        return <ClickOutlined />;
      case 'input':
        return <EditOutlined />;
      case 'navigation':
        return <CompassOutlined />;
      case 'http':
        return <ApiOutlined />;
      case 'error':
        return <BugOutlined />;
      default:
        return <InfoCircleOutlined />;
    }
  };

  const getColor = (category: string) => {
    switch (category) {
      case 'error':
        return 'red';
      case 'http':
        return 'blue';
      case 'navigation':
        return 'green';
      case 'click':
        return 'purple';
      case 'input':
        return 'orange';
      default:
        return 'default';
    }
  };

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      fractionalSecondDigits: 3,
    });
  };

  const formatData = (data: any) => {
    if (!data) return null;

    if (data.selector) {
      return <Text code>{data.selector}</Text>;
    }

    if (data.url) {
      return (
        <Text type="secondary" style={{ fontSize: 12 }}>
          {data.method} {data.url}
          {data.status && ` - ${data.status}`}
        </Text>
      );
    }

    if (data.from && data.to) {
      return (
        <Text type="secondary" style={{ fontSize: 12 }}>
          {data.from} → {data.to}
        </Text>
      );
    }

    return null;
  };

  const items = breadcrumbs.map((breadcrumb, index) => {
    const isError = errorTimestamp && breadcrumb.timestamp === errorTimestamp;

    return {
      key: index,
      dot: getIcon(breadcrumb.category),
      color: isError ? 'red' : getColor(breadcrumb.category),
      children: (
        <div style={{ marginBottom: 16 }}>
          <div style={{ marginBottom: 4 }}>
            <Tag color={getColor(breadcrumb.category)}>
              {breadcrumb.category}
            </Tag>
            <Text type="secondary" style={{ fontSize: 12 }}>
              {formatTime(breadcrumb.timestamp)}
            </Text>
          </div>
          <div style={{ marginBottom: 4 }}>
            <Text strong={isError}>{breadcrumb.message}</Text>
          </div>
          {formatData(breadcrumb.data)}
        </div>
      ),
    };
  });

  return (
    <div style={{ padding: '16px 0' }}>
      <Timeline items={items} />
    </div>
  );
};
