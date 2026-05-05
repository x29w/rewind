/**
 * API 监控页
 * API Monitoring Page
 * APIモニタリングページ
 * API 監控頁
 */

import React, { useState } from 'react';
import {
  Card,
  Table,
  Tag,
  Select,
  Space,
  Statistic,
  Row,
  Col,
  Typography,
  Button,
  Tooltip,
} from 'antd';
import {
  ApiOutlined,
  ThunderboltOutlined,
  ClockCircleOutlined,
  WarningOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
} from '@ant-design/icons';

const { Option } = Select;
const { Text } = Typography;

interface ApiData {
  id: string;
  url: string;
  method: string;
  errorCount: number;
  totalCount: number;
  avgDuration: number;
  p95Duration: number;
  errorRate: number;
  lastError: string;
  status: 'normal' | 'warning' | 'error';
}

const methodColors: Record<string, string> = {
  GET: 'blue',
  POST: 'green',
  PUT: 'orange',
  DELETE: 'red',
  PATCH: 'purple',
};

export const ApiMonitoringPage: React.FC = () => {
  const [timeRange, setTimeRange] = useState('24h');
  const [methodFilter, setMethodFilter] = useState('all');

  // 模拟数据
  const apiData: ApiData[] = [
    {
      id: '1',
      url: '/api/v1/users',
      method: 'GET',
      errorCount: 156,
      totalCount: 1248,
      avgDuration: 1250,
      p95Duration: 2100,
      errorRate: 12.5,
      lastError: '2026-05-05T09:45:00Z',
      status: 'error',
    },
    {
      id: '2',
      url: '/api/v1/orders',
      method: 'POST',
      errorCount: 89,
      totalCount: 1085,
      avgDuration: 850,
      p95Duration: 1500,
      errorRate: 8.2,
      lastError: '2026-05-05T09:30:00Z',
      status: 'warning',
    },
    {
      id: '3',
      url: '/api/v1/products',
      method: 'GET',
      errorCount: 12,
      totalCount: 2456,
      avgDuration: 650,
      p95Duration: 980,
      errorRate: 0.5,
      lastError: '2026-05-05T08:15:00Z',
      status: 'normal',
    },
    {
      id: '4',
      url: '/api/v1/auth/login',
      method: 'POST',
      errorCount: 45,
      totalCount: 892,
      avgDuration: 450,
      p95Duration: 720,
      errorRate: 5.0,
      lastError: '2026-05-05T09:20:00Z',
      status: 'warning',
    },
  ];

  const stats = {
    totalErrors: 302,
    errorTrend: 12,
    avgErrorRate: 6.5,
    rateTrend: -3,
    avgResponseTime: 800,
    timeTrend: 5,
    slowRequests: 34,
    slowTrend: -8,
  };

  const columns = [
    {
      title: 'API 端点',
      dataIndex: 'url',
      key: 'url',
      width: 300,
      render: (text: string, record: ApiData) => (
        <Space direction="vertical" size={0}>
          <Space>
            <Tag color={methodColors[record.method]}>{record.method}</Tag>
            <Text strong>{text}</Text>
          </Space>
          <Text type="secondary" style={{ fontSize: 12 }}>
            总请求: {record.totalCount}
          </Text>
        </Space>
      ),
    },
    {
      title: '错误数',
      dataIndex: 'errorCount',
      key: 'errorCount',
      width: 100,
      sorter: (a: ApiData, b: ApiData) => a.errorCount - b.errorCount,
      render: (count: number) => (
        <Text strong style={{ color: count > 100 ? '#ff4d4f' : undefined }}>
          {count}
        </Text>
      ),
    },
    {
      title: '错误率',
      dataIndex: 'errorRate',
      key: 'errorRate',
      width: 100,
      sorter: (a: ApiData, b: ApiData) => a.errorRate - b.errorRate,
      render: (rate: number) => {
        const color = rate > 10 ? 'red' : rate > 5 ? 'orange' : 'green';
        return <Tag color={color}>{rate.toFixed(1)}%</Tag>;
      },
    },
    {
      title: '平均耗时',
      dataIndex: 'avgDuration',
      key: 'avgDuration',
      width: 120,
      sorter: (a: ApiData, b: ApiData) => a.avgDuration - b.avgDuration,
      render: (val: number) => (
        <Tooltip title="平均响应时间">
          <Text>{val}ms</Text>
        </Tooltip>
      ),
    },
    {
      title: 'P95 耗时',
      dataIndex: 'p95Duration',
      key: 'p95Duration',
      width: 120,
      sorter: (a: ApiData, b: ApiData) => a.p95Duration - b.p95Duration,
      render: (val: number) => (
        <Tooltip title="95% 请求的响应时间">
          <Text style={{ color: val > 2000 ? '#ff4d4f' : undefined }}>
            {val}ms
          </Text>
        </Tooltip>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      filters: [
        { text: '正常', value: 'normal' },
        { text: '警告', value: 'warning' },
        { text: '异常', value: 'error' },
      ],
      onFilter: (value: any, record: ApiData) => record.status === value,
      render: (status: string) => {
        const config = {
          normal: { color: 'green', text: '正常' },
          warning: { color: 'orange', text: '警告' },
          error: { color: 'red', text: '异常' },
        };
        const { color, text } = config[status as keyof typeof config];
        return <Tag color={color}>{text}</Tag>;
      },
    },
    {
      title: '最后错误',
      dataIndex: 'lastError',
      key: 'lastError',
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
      width: 100,
      render: (_: any, record: ApiData) => (
        <Button type="link" size="small">
          查看详情
        </Button>
      ),
    },
  ];

  const filteredData = apiData.filter((item) => {
    if (methodFilter !== 'all' && item.method !== methodFilter) {
      return false;
    }
    return true;
  });

  return (
    <div style={{ padding: 24 }}>
      {/* 页面头部 */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ margin: 0, fontSize: 24 }}>
          <ApiOutlined style={{ marginRight: 8 }} />
          API 监控
        </h1>
        <Text type="secondary">实时监控 API 请求性能和错误情况</Text>
      </div>

      {/* 核心指标 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="API 错误总数"
              value={stats.totalErrors}
              prefix={<WarningOutlined />}
              suffix={
                <span
                  style={{
                    fontSize: 14,
                    color: stats.errorTrend > 0 ? '#cf1322' : '#3f8600',
                  }}
                >
                  {stats.errorTrend > 0 ? (
                    <ArrowUpOutlined />
                  ) : (
                    <ArrowDownOutlined />
                  )}{' '}
                  {Math.abs(stats.errorTrend)}%
                </span>
              }
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="平均错误率"
              value={stats.avgErrorRate}
              suffix="%"
              prefix={<ThunderboltOutlined />}
              valueStyle={{
                color: stats.avgErrorRate > 5 ? '#cf1322' : '#3f8600',
              }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="平均响应时间"
              value={stats.avgResponseTime}
              suffix="ms"
              prefix={<ClockCircleOutlined />}
              valueStyle={{
                color: stats.avgResponseTime > 1000 ? '#cf1322' : undefined,
              }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="慢请求 (>2s)"
              value={stats.slowRequests}
              prefix={<ClockCircleOutlined />}
              suffix={
                <span
                  style={{
                    fontSize: 14,
                    color: stats.slowTrend > 0 ? '#cf1322' : '#3f8600',
                  }}
                >
                  {stats.slowTrend > 0 ? (
                    <ArrowUpOutlined />
                  ) : (
                    <ArrowDownOutlined />
                  )}{' '}
                  {Math.abs(stats.slowTrend)}%
                </span>
              }
            />
          </Card>
        </Col>
      </Row>

      {/* API 列表 */}
      <Card
        title="API 错误列表"
        extra={
          <Space>
            <Select
              value={methodFilter}
              onChange={setMethodFilter}
              style={{ width: 150 }}
            >
              <Option value="all">所有方法</Option>
              <Option value="GET">GET</Option>
              <Option value="POST">POST</Option>
              <Option value="PUT">PUT</Option>
              <Option value="DELETE">DELETE</Option>
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
          dataSource={filteredData}
          rowKey="id"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `共 ${total} 条`,
          }}
        />
      </Card>
    </div>
  );
};
