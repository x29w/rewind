import React, { useEffect, useState } from 'react';
import { Table, Tag, Input, Select, Space, Button } from 'antd';
import { useNavigate } from '@tanstack/react-router';
import type { ColumnsType } from 'antd/es/table';

const { Search } = Input;
const { Option } = Select;

interface Issue {
  id: string;
  title: string;
  level: string;
  type: string;
  status: string;
  eventCount: number;
  userCount: number;
  firstSeen: string;
  lastSeen: string;
}

const levelColors: Record<string, string> = {
  fatal: 'red',
  error: 'orange',
  warning: 'gold',
  info: 'blue',
};

export const IssueListPage: React.FC = () => {
  const navigate = useNavigate();
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    status: 'all',
    level: 'all',
    type: 'all',
    search: '',
  });

  const columns: ColumnsType<Issue> = [
    {
      title: 'Issue',
      dataIndex: 'title',
      key: 'title',
      render: (text, record) => (
        <div>
          <div style={{ fontWeight: 500, marginBottom: 4 }}>{text}</div>
          <Space>
            <Tag color={levelColors[record.level]}>{record.level.toUpperCase()}</Tag>
            <Tag>{record.type}</Tag>
          </Space>
        </div>
      ),
    },
    {
      title: 'Events',
      dataIndex: 'eventCount',
      key: 'eventCount',
      width: 100,
      sorter: (a, b) => a.eventCount - b.eventCount,
    },
    {
      title: 'Users',
      dataIndex: 'userCount',
      key: 'userCount',
      width: 100,
      sorter: (a, b) => a.userCount - b.userCount,
    },
    {
      title: 'First Seen',
      dataIndex: 'firstSeen',
      key: 'firstSeen',
      width: 180,
      render: (text) => new Date(text).toLocaleString(),
    },
    {
      title: 'Last Seen',
      dataIndex: 'lastSeen',
      key: 'lastSeen',
      width: 180,
      render: (text) => new Date(text).toLocaleString(),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status) => (
        <Tag color={status === 'open' ? 'red' : 'green'}>
          {status.toUpperCase()}
        </Tag>
      ),
    },
  ];

  const mockIssues: Issue[] = [
    {
      id: '1',
      title: 'TypeError: Cannot read property of undefined',
      level: 'error',
      type: 'error',
      status: 'open',
      eventCount: 245,
      userCount: 89,
      firstSeen: '2026-05-01T10:30:00Z',
      lastSeen: '2026-05-05T09:15:00Z',
    },
    {
      id: '2',
      title: 'Network request failed',
      level: 'warning',
      type: 'api',
      status: 'open',
      eventCount: 156,
      userCount: 45,
      firstSeen: '2026-05-02T14:20:00Z',
      lastSeen: '2026-05-05T08:45:00Z',
    },
    {
      id: '3',
      title: 'Blank screen detected',
      level: 'fatal',
      type: 'blank_screen',
      status: 'resolved',
      eventCount: 12,
      userCount: 8,
      firstSeen: '2026-04-28T16:00:00Z',
      lastSeen: '2026-04-30T11:30:00Z',
    },
  ];

  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      setIssues(mockIssues);
      setLoading(false);
    }, 500);
  }, []);

  return (
    <div>
      <h1>Issues</h1>
      
      <Space style={{ marginBottom: 16 }} size="middle">
        <Search
          placeholder="Search issues..."
          style={{ width: 300 }}
          onSearch={(value) => setFilters({ ...filters, search: value })}
        />
        
        <Select
          value={filters.status}
          style={{ width: 120 }}
          onChange={(value) => setFilters({ ...filters, status: value })}
        >
          <Option value="all">All Status</Option>
          <Option value="open">Open</Option>
          <Option value="resolved">Resolved</Option>
          <Option value="ignored">Ignored</Option>
        </Select>

        <Select
          value={filters.level}
          style={{ width: 120 }}
          onChange={(value) => setFilters({ ...filters, level: value })}
        >
          <Option value="all">All Levels</Option>
          <Option value="fatal">Fatal</Option>
          <Option value="error">Error</Option>
          <Option value="warning">Warning</Option>
          <Option value="info">Info</Option>
        </Select>

        <Select
          value={filters.type}
          style={{ width: 150 }}
          onChange={(value) => setFilters({ ...filters, type: value })}
        >
          <Option value="all">All Types</Option>
          <Option value="error">Error</Option>
          <Option value="api">API</Option>
          <Option value="blank_screen">Blank Screen</Option>
          <Option value="performance">Performance</Option>
        </Select>

        <Button type="primary">Refresh</Button>
      </Space>

      <Table
        columns={columns}
        dataSource={issues}
        rowKey="id"
        loading={loading}
        pagination={{
          total: issues.length,
          pageSize: 20,
          showSizeChanger: true,
          showTotal: (total) => `Total ${total} issues`,
        }}
        onRow={(record) => ({
          onClick: () => navigate({ to: `/issues/${record.id}` }),
          style: { cursor: 'pointer' },
        })}
      />
    </div>
  );
};
