/**
 * 白屏检测页
 * Blank Screen Detection Page
 * ブランクスクリーン検出ページ
 * 白屏檢測頁
 */

import React, { useState } from 'react';
import {
  Card,
  Table,
  Space,
  Select,
  Statistic,
  Row,
  Col,
  Typography,
  Tag,
  Button,
  Tooltip,
} from 'antd';
import {
  BarChartOutlined,
  UserOutlined,
  ClockCircleOutlined,
  WarningOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  EyeOutlined,
} from '@ant-design/icons';

const { Option } = Select;
const { Text } = Typography;

interface BlankScreenData {
  id: string;
  url: string;
  count: number;
  userCount: number;
  avgDuration: number;
  maxDuration: number;
  lastSeen: string;
  severity: 'low' | 'medium' | 'high';
}

const severityColors: Record<string, string> = {
  low: 'green',
  medium: 'orange',
  high: 'red',
};

const severityLabels: Record<string, string> = {
  low: '低',
  medium: '中',
  high: '高',
};

export const BlankScreenPage: React.FC = () => {
  const [timeRange, setTimeRange] = useState('24h');
  const [sortBy, setSortBy] = useState('count');

  // 模拟数据
  const blankScreenData: BlankScreenData[] = [
    {
      id: '1',
      url: '/dashboard',
      count: 45,
      userCount: 23,
      avgDuration: 5200,
      maxDuration: 12000,
      lastSeen: '2026-05-05T09:30:00Z',
      severity: 'high',
    },
    {
      id: '2',
      url: '/profile',
      count: 12,
      userCount: 8,
      avgDuration: 6100,
      maxDuration: 9500,
      lastSeen: '2026-05-05T08:15:00Z',
      severity: 'medium',
    },
    {
      id: '3',
      url: '/settings',
      count: 8,
      userCount: 5,
      avgDuration: 3200,
      maxDuration: 5800,
      lastSeen: '2026-05-05T07:45:00Z',
      severity: 'low',
    },
    {
      id: '4',
      url: '/orders',
      count: 18,
      userCount: 12,
      avgDuration: 4800,
      maxDuration: 8200,
      lastSeen: '2026-05-05T09:00:00Z',
      severity: 'medium',
    },
  ];

  const stats = {
    totalDetections: 83,
    detectionTrend: 28.5,
    affectedUsers: 48,
    userTrend: 15,
    avgDuration: 5.1,
    durationTrend: -5,
    highSeverity: 12,
    severityTrend: 8,
  };

  const columns = [
    {
      title: '页面 URL',
      dataIndex: 'url',
      key: 'url',
      width: 250,
      render: (text: string) => (
        <Tooltip title={text}>
          <Text strong>{text}</Text>
        </Tooltip>
      ),
    },
    {
      title: '检测次数',
      dataIndex: 'count',
      key: 'count',
      width: 120,
      sorter: (a: BlankScreenData, b: BlankScreenData) => a.count - b.count,
      render: (count: number) => (
        <Text strong style={{ color: count > 30 ? '#ff4d4f' : undefined }}>
          {count}
        </Text>
      ),
    },
    {
      title: '影响用户',
      dataIndex: 'userCount',
      key: 'userCount',
      width: 120,
      sorter: (a: BlankScreenData, b: BlankScreenData) =>
        a.userCount - b.userCount,
      render: (count: number) => (
        <Space>
          <UserOutlined />
          <Text>{count}</Text>
        </Space>
      ),
    },
    {
      title: '平均时长',
      dataIndex: 'avgDuration',
      key: 'avgDuration',
      width: 120,
      sorter: (a: BlankScreenData, b: BlankScreenData) =>
        a.avgDuration - b.avgDuration,
      render: (val: number) => (
        <Tooltip title="白屏平均持续时间">
          <Text style={{ color: val > 5000 ? '#ff4d4f' : undefined }}>
            {(val / 1000).toFixed(1)}s
          </Text>
        </Tooltip>
      ),
    },
    {
      title: '最长时长',
      dataIndex: 'maxDuration',
      key: 'maxDuration',
      width: 120,
      sorter: (a: BlankScreenData, b: BlankScreenData) =>
        a.maxDuration - b.maxDuration,
      render: (val: number) => (
        <Tooltip title="白屏最长持续时间">
          <Text type="secondary">{(val / 1000).toFixed(1)}s</Text>
        </Tooltip>
      ),
    },
    {
      title: '严重程度',
      dataIndex: 'severity',
      key: 'severity',
      width: 100,
      filters: [
        { text: '低', value: 'low' },
        { text: '中', value: 'medium' },
        { text: '高', value: 'high' },
      ],
      onFilter: (value: any, record: BlankScreenData) =>
        record.severity === value,
      render: (severity: string) => (
        <Tag color={severityColors[severity]}>
          {severityLabels[severity]}
        </Tag>
      ),
    },
    {
      title: '最后检测',
      dataIndex: 'lastSeen',
      key: 'lastSeen',
      width: 180,
      render: (text: string) => (
        <Text type="secondary" style={{ fontSize: 12 }}>
          {new Date(text).toLocaleString('zh-CN')}
        </Text>
      ),
    },
    {
      title: '操作',
      key: 'actions',
      width: 120,
      render: (_: any, record: BlankScreenData) => (
        <Space>
          <Button type="link" size="small" icon={<EyeOutlined />}>
            查看详情
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      {/* 页面头部 */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ margin: 0, fontSize: 24 }}>
          <BarChartOutlined style={{ marginRight: 8 }} />
          白屏检测
        </h1>
        <Text type="secondary">
          自动检测页面白屏问题，关联用户操作轨迹
        </Text>
      </div>

      {/* 核心指标 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="检测总数"
              value={stats.totalDetections}
              prefix={<WarningOutlined />}
              suffix={
                <span
                  style={{
                    fontSize: 14,
                    color:
                      stats.detectionTrend > 0 ? '#cf1322' : '#3f8600',
                  }}
                >
                  {stats.detectionTrend > 0 ? (
                    <ArrowUpOutlined />
                  ) : (
                    <ArrowDownOutlined />
                  )}{' '}
                  {Math.abs(stats.detectionTrend)}%
                </span>
              }
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="影响用户"
              value={stats.affectedUsers}
              prefix={<UserOutlined />}
              suffix={
                <span
                  style={{
                    fontSize: 14,
                    color: stats.userTrend > 0 ? '#cf1322' : '#3f8600',
                  }}
                >
                  {stats.userTrend > 0 ? (
                    <ArrowUpOutlined />
                  ) : (
                    <ArrowDownOutlined />
                  )}{' '}
                  {Math.abs(stats.userTrend)}%
                </span>
              }
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="平均时长"
              value={stats.avgDuration}
              suffix="s"
              prefix={<ClockCircleOutlined />}
              valueStyle={{
                color: stats.avgDuration > 5 ? '#cf1322' : undefined,
              }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="高严重度"
              value={stats.highSeverity}
              prefix={<WarningOutlined />}
              valueStyle={{ color: '#cf1322' }}
              suffix={
                <span style={{ fontSize: 14, color: '#cf1322' }}>
                  <ArrowUpOutlined /> {stats.severityTrend}%
                </span>
              }
            />
          </Card>
        </Col>
      </Row>

      {/* 白屏列表 */}
      <Card
        title="白屏检测列表"
        extra={
          <Space>
            <Select
              value={sortBy}
              onChange={setSortBy}
              style={{ width: 150 }}
            >
              <Option value="count">按检测次数</Option>
              <Option value="userCount">按影响用户</Option>
              <Option value="avgDuration">按平均时长</Option>
              <Option value="lastSeen">按最后检测</Option>
            </Select>
            <Select
              value={timeRange}
              onChange={setTimeRange}
              style={{ width: 120 }}
            >
              <Option value="1h">最近 1 小时</Option>
              <Option value="24h">最近 24 小时</Option>
              <Option value="7d">最近 7 天</Option>
              <Option value="30d">最近 30 天</Option>
            </Select>
          </Space>
        }
      >
        <Table
          columns={columns}
          dataSource={blankScreenData}
          rowKey="id"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `共 ${total} 条`,
          }}
        />
      </Card>

      {/* 说明卡片 */}
      <Card
        title="白屏检测说明"
        style={{ marginTop: 16 }}
        size="small"
      >
        <Space direction="vertical" size="small">
          <Text>
            <strong>检测原理：</strong>
            通过监控页面渲染时间和 DOM 节点数量，自动识别白屏问题
          </Text>
          <Text>
            <strong>严重程度判定：</strong>
          </Text>
          <ul style={{ marginTop: 8, marginBottom: 0 }}>
            <li>
              <Tag color="red">高</Tag> 白屏时长 &gt; 5s 或检测次数 &gt; 30
            </li>
            <li>
              <Tag color="orange">中</Tag> 白屏时长 3-5s 或检测次数 10-30
            </li>
            <li>
              <Tag color="green">低</Tag> 白屏时长 &lt; 3s 且检测次数 &lt; 10
            </li>
          </ul>
        </Space>
      </Card>
    </div>
  );
};
