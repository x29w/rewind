/**
 * Issue 列表页
 * Issue List Page
 * Issue リストページ
 * Issue 列表頁
 */

import React, { useEffect, useState } from 'react';
import {
  Table,
  Tag,
  Space,
  Button,
  Select,
  Input,
  Card,
  Statistic,
  Row,
  Col,
  Dropdown,
  message,
} from 'antd';
import {
  BugOutlined,
  WarningOutlined,
  InfoCircleOutlined,
  SearchOutlined,
  ReloadOutlined,
  FilterOutlined,
} from '@ant-design/icons';
import { useNavigate, useParams } from '@tanstack/react-router';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchIssues, updateIssueStatus } from '../store/issue.slice';
import type { ColumnsType } from 'antd/es/table';

const { Option } = Select;
const { Search } = Input;

interface Issue {
  id: string;
  type: string;
  level: string;
  status: string;
  title: string;
  message: string;
  eventCount: number;
  userCount: number;
  firstSeen: string;
  lastSeen: string;
  environment?: string;
  aiSummary?: string;
}

export const IssueListPage: React.FC = () => {
  const navigate = useNavigate();
  const { projectId } = useParams({ strict: false });
  const dispatch = useAppDispatch();
  const { issues, loading, total, page, pageSize } = useAppSelector(
    (state) => state.issue,
  );

  const [filters, setFilters] = useState({
    status: undefined as string | undefined,
    level: undefined as string | undefined,
    type: undefined as string | undefined,
    search: undefined as string | undefined,
  });

  useEffect(() => {
    if (projectId) {
      loadIssues();
    }
  }, [projectId, page, filters]);

  const loadIssues = () => {
    if (!projectId) return;
    dispatch(
      fetchIssues({
        projectId,
        params: {
          page,
          pageSize,
          ...filters,
        },
      }),
    );
  };

  const handleStatusChange = async (issueId: string, status: string) => {
    if (!projectId) return;
    try {
      await dispatch(updateIssueStatus({ projectId, issueId, status }));
      message.success('状态更新成功');
    } catch (error) {
      message.error('状态更新失败');
    }
  };

  const getLevelIcon = (level: string) => {
    switch (level) {
      case 'error':
        return <BugOutlined style={{ color: '#ff4d4f' }} />;
      case 'warning':
        return <WarningOutlined style={{ color: '#faad14' }} />;
      default:
        return <InfoCircleOutlined style={{ color: '#1890ff' }} />;
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'error':
        return 'red';
      case 'warning':
        return 'orange';
      default:
        return 'blue';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'red';
      case 'resolved':
        return 'green';
      case 'ignored':
        return 'default';
      case 'regressed':
        return 'orange';
      default:
        return 'default';
    }
  };

  const getStatusText = (status: string) => {
    const map: Record<string, string> = {
      open: '未解决',
      resolved: '已解决',
      ignored: '已忽略',
      regressed: '已回归',
    };
    return map[status] || status;
  };

  const columns: ColumnsType<Issue> = [
    {
      title: '问题',
      dataIndex: 'title',
      key: 'title',
      width: '40%',
      render: (text, record) => (
        <div>
          <div style={{ marginBottom: 4 }}>
            {getLevelIcon(record.level)}{' '}
            <a
              onClick={() =>
                navigate({
                  to: `/projects/${projectId}/issues/${record.id}`,
                })
              }
              style={{ fontWeight: 500 }}
            >
              {text}
            </a>
          </div>
          {record.aiSummary && (
            <div style={{ fontSize: 12, color: '#999' }}>
              {record.aiSummary}
            </div>
          )}
        </div>
      ),
    },
    {
      title: '级别',
      dataIndex: 'level',
      key: 'level',
      width: 100,
      render: (level) => (
        <Tag color={getLevelColor(level)}>
          {level.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status, record) => (
        <Dropdown
          menu={{
            items: [
              { key: 'open', label: '未解决' },
              { key: 'resolved', label: '已解决' },
              { key: 'ignored', label: '已忽略' },
            ],
            onClick: ({ key }) => handleStatusChange(record.id, key),
          }}
        >
          <Tag color={getStatusColor(status)} style={{ cursor: 'pointer' }}>
            {getStatusText(status)}
          </Tag>
        </Dropdown>
      ),
    },
    {
      title: '事件数',
      dataIndex: 'eventCount',
      key: 'eventCount',
      width: 100,
      sorter: true,
      render: (count) => count.toLocaleString(),
    },
    {
      title: '影响用户',
      dataIndex: 'userCount',
      key: 'userCount',
      width: 100,
      sorter: true,
      render: (count) => count.toLocaleString(),
    },
    {
      title: '最后发生',
      dataIndex: 'lastSeen',
      key: 'lastSeen',
      width: 180,
      sorter: true,
      render: (date) => new Date(date).toLocaleString('zh-CN'),
    },
  ];

  // 统计数据
  const stats = {
    total: issues.length,
    open: issues.filter((i) => i.status === 'open').length,
    resolved: issues.filter((i) => i.status === 'resolved').length,
    regressed: issues.filter((i) => i.status === 'regressed').length,
  };

  return (
    <div style={{ padding: 24 }}>
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="总问题数"
              value={total}
              prefix={<BugOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="未解决"
              value={stats.open}
              valueStyle={{ color: '#ff4d4f' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="已解决"
              value={stats.resolved}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="已回归"
              value={stats.regressed}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
      </Row>

      <Card>
        <Space style={{ marginBottom: 16, width: '100%' }} direction="vertical">
          <Space>
            <Search
              placeholder="搜索问题"
              allowClear
              style={{ width: 300 }}
              onSearch={(value) =>
                setFilters({ ...filters, search: value || undefined })
              }
              prefix={<SearchOutlined />}
            />
            <Select
              placeholder="状态"
              allowClear
              style={{ width: 120 }}
              onChange={(value) => setFilters({ ...filters, status: value })}
            >
              <Option value="open">未解决</Option>
              <Option value="resolved">已解决</Option>
              <Option value="ignored">已忽略</Option>
              <Option value="regressed">已回归</Option>
            </Select>
            <Select
              placeholder="级别"
              allowClear
              style={{ width: 120 }}
              onChange={(value) => setFilters({ ...filters, level: value })}
            >
              <Option value="error">Error</Option>
              <Option value="warning">Warning</Option>
              <Option value="info">Info</Option>
            </Select>
            <Button
              icon={<ReloadOutlined />}
              onClick={loadIssues}
              loading={loading}
            >
              刷新
            </Button>
          </Space>
        </Space>

        <Table
          columns={columns}
          dataSource={issues}
          rowKey="id"
          loading={loading}
          pagination={{
            current: page,
            pageSize,
            total,
            showSizeChanger: true,
            showTotal: (total) => `共 ${total} 条`,
          }}
        />
      </Card>
    </div>
  );
};
