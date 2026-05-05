import React from 'react';
import { Card, Table, Tag, Select, Space, Statistic, Row, Col } from 'antd';
import { Column } from '@ant-design/plots';

const { Option } = Select;

export const ApiMonitoringPage: React.FC = () => {
  const apiData = [
    {
      id: '1',
      url: '/api/v1/users',
      method: 'GET',
      errorCount: 156,
      avgDuration: 1250,
      p95Duration: 2100,
      errorRate: '12.5%',
      lastError: '2026-05-05T09:45:00Z',
    },
    {
      id: '2',
      url: '/api/v1/orders',
      method: 'POST',
      errorCount: 89,
      avgDuration: 850,
      p95Duration: 1500,
      errorRate: '8.2%',
      lastError: '2026-05-05T09:30:00Z',
    },
  ];

  const performanceData = [
    { api: '/api/v1/users', duration: 1250 },
    { api: '/api/v1/orders', duration: 850 },
    { api: '/api/v1/products', duration: 650 },
    { api: '/api/v1/auth', duration: 450 },
  ];

  const columns = [
    {
      title: 'API Endpoint',
      dataIndex: 'url',
      key: 'url',
      render: (text: string, record: any) => (
        <div>
          <Tag color="blue">{record.method}</Tag>
          {text}
        </div>
      ),
    },
    {
      title: 'Error Count',
      dataIndex: 'errorCount',
      key: 'errorCount',
      sorter: (a: any, b: any) => a.errorCount - b.errorCount,
    },
    {
      title: 'Error Rate',
      dataIndex: 'errorRate',
      key: 'errorRate',
      render: (rate: string) => <Tag color="red">{rate}</Tag>,
    },
    {
      title: 'Avg Duration',
      dataIndex: 'avgDuration',
      key: 'avgDuration',
      render: (val: number) => `${val}ms`,
    },
    {
      title: 'P95 Duration',
      dataIndex: 'p95Duration',
      key: 'p95Duration',
      render: (val: number) => `${val}ms`,
    },
    {
      title: 'Last Error',
      dataIndex: 'lastError',
      key: 'lastError',
      render: (text: string) => new Date(text).toLocaleString(),
    },
  ];

  const config = {
    data: performanceData,
    xField: 'api',
    yField: 'duration',
    label: {
      position: 'top' as const,
      style: {
        fill: '#000000',
        opacity: 0.6,
      },
    },
    xAxis: {
      label: {
        autoRotate: false,
      },
    },
    meta: {
      api: {
        alias: 'API Endpoint',
      },
      duration: {
        alias: 'Duration (ms)',
      },
    },
  };

  return (
    <div>
      <h1>API Monitoring</h1>

      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card>
            <Statistic title="Total API Errors" value={245} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="Avg Error Rate" value="10.3%" valueStyle={{ color: '#cf1322' }} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="Avg Response Time" value="950ms" />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="Slow Requests (>2s)" value={34} />
          </Card>
        </Col>
      </Row>

      <Card title="API Performance" style={{ marginBottom: 24 }}>
        <Space style={{ marginBottom: 16 }}>
          <Select defaultValue="all" style={{ width: 150 }}>
            <Option value="all">All Methods</Option>
            <Option value="GET">GET</Option>
            <Option value="POST">POST</Option>
            <Option value="PUT">PUT</Option>
            <Option value="DELETE">DELETE</Option>
          </Select>
          <Select defaultValue="24h" style={{ width: 120 }}>
            <Option value="1h">Last Hour</Option>
            <Option value="24h">Last 24h</Option>
            <Option value="7d">Last 7 Days</Option>
          </Select>
        </Space>
        <Column {...config} />
      </Card>

      <Card title="API Error List">
        <Table columns={columns} dataSource={apiData} rowKey="id" />
      </Card>
    </div>
  );
};
