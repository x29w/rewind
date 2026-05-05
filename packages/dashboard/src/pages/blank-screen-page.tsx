import React from 'react';
import { Card, Table, DatePicker, Space, Select, Statistic, Row, Col } from 'antd';
import { Line } from '@ant-design/plots';

const { RangePicker } = DatePicker;
const { Option } = Select;

export const BlankScreenPage: React.FC = () => {
  const blankScreenData = [
    {
      id: '1',
      url: '/dashboard',
      count: 45,
      userCount: 23,
      avgDuration: 5200,
      lastSeen: '2026-05-05T09:30:00Z',
    },
    {
      id: '2',
      url: '/profile',
      count: 12,
      userCount: 8,
      avgDuration: 6100,
      lastSeen: '2026-05-05T08:15:00Z',
    },
  ];

  const trendData = [
    { date: '05-01', count: 12 },
    { date: '05-02', count: 18 },
    { date: '05-03', count: 25 },
    { date: '05-04', count: 32 },
    { date: '05-05', count: 45 },
  ];

  const columns = [
    {
      title: 'Page URL',
      dataIndex: 'url',
      key: 'url',
    },
    {
      title: 'Occurrences',
      dataIndex: 'count',
      key: 'count',
      sorter: (a: any, b: any) => a.count - b.count,
    },
    {
      title: 'Affected Users',
      dataIndex: 'userCount',
      key: 'userCount',
    },
    {
      title: 'Avg Duration (ms)',
      dataIndex: 'avgDuration',
      key: 'avgDuration',
      render: (val: number) => `${val}ms`,
    },
    {
      title: 'Last Seen',
      dataIndex: 'lastSeen',
      key: 'lastSeen',
      render: (text: string) => new Date(text).toLocaleString(),
    },
  ];

  const config = {
    data: trendData,
    xField: 'date',
    yField: 'count',
    point: {
      size: 5,
      shape: 'diamond',
    },
    label: {
      style: {
        fill: '#aaa',
      },
    },
  };

  return (
    <div>
      <h1>Blank Screen Detection</h1>

      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card>
            <Statistic title="Total Detections" value={57} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="Affected Users" value={31} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="Avg Duration" value="5.4s" />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic 
              title="Trend" 
              value={28.5} 
              suffix="%" 
              valueStyle={{ color: '#cf1322' }}
            />
          </Card>
        </Col>
      </Row>

      <Card title="Trend" style={{ marginBottom: 24 }}>
        <Space style={{ marginBottom: 16 }}>
          <RangePicker />
          <Select defaultValue="day" style={{ width: 120 }}>
            <Option value="hour">Hour</Option>
            <Option value="day">Day</Option>
            <Option value="week">Week</Option>
          </Select>
        </Space>
        <Line {...config} />
      </Card>

      <Card title="Blank Screen List">
        <Table columns={columns} dataSource={blankScreenData} rowKey="id" />
      </Card>
    </div>
  );
};
