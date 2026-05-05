/**
 * Dashboard 总览页
 * Dashboard Overview Page
 * ダッシュボード概要ページ
 * Dashboard 總覽頁
 */

import React, { useEffect } from 'react';
import {
  Card,
  Row,
  Col,
  Statistic,
  Typography,
  Space,
  Progress,
  Table,
  Tag,
  Button,
} from 'antd';
import {
  BugOutlined,
  UserOutlined,
  ThunderboltOutlined,
  BarChartOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  CheckCircleOutlined,
  WarningOutlined,
  RiseOutlined,
} from '@ant-design/icons';
import { useNavigate } from '@tanstack/react-router';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchIssues } from '../store/issue.slice';
import { ISSUE_LEVEL_COLORS, ISSUE_STATUS_COLORS } from '../constants/issue';

const { Title, Text } = Typography;

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { currentProject } = useAppSelector((state) => state.project);
  const { issues } = useAppSelector((state) => state.issue);

  useEffect(() => {
    if (currentProject) {
      dispatch(fetchIssues({ projectId: currentProject.id }));
    }
  }, [currentProject, dispatch]);

  // 计算健康度评分（0-100）
  const calculateHealthScore = () => {
    if (!issues.length) return 100;
    
    const openIssues = issues.filter((i) => i.status === 'open').length;
    const totalIssues = issues.length;
    const errorRate = (openIssues / totalIssues) * 100;
    
    // 健康度 = 100 - 错误率
    const score = Math.max(0, Math.min(100, 100 - errorRate));
    return Math.round(score);
  };

  const healthScore = calculateHealthScore();
  const getHealthColor = (score: number) => {
    if (score >= 80) return '#52c41a';
    if (score >= 60) return '#faad14';
    return '#ff4d4f';
  };

  // 模拟数据
  const stats = {
    totalErrors: 1234,
    errorTrend: 12,
    newIssues: 45,
    issueTrend: -8,
    affectedUsers: 892,
    userTrend: 5,
    errorRate: 2.5,
    rateTrend: -3,
  };

  // 热点问题 Top 5
  const topIssues = issues.slice(0, 5).map((issue) => ({
    key: issue.id,
    title: issue.title,
    level: issue.level,
    status: issue.status,
    eventCount: issue.eventCount,
    userCount: issue.userCount,
  }));

  const issueColumns = [
    {
      title: '问题',
      dataIndex: 'title',
      key: 'title',
      ellipsis: true,
      render: (text: string, record: any) => (
        <a onClick={() => navigate({ to: `/issues/${record.key}` })}>{text}</a>
      ),
    },
    {
      title: '级别',
      dataIndex: 'level',
      key: 'level',
      width: 80,
      render: (level: string) => (
        <Tag color={ISSUE_LEVEL_COLORS[level as keyof typeof ISSUE_LEVEL_COLORS]}>
          {level.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 80,
      render: (status: string) => (
        <Tag color={ISSUE_STATUS_COLORS[status as keyof typeof ISSUE_STATUS_COLORS]}>
          {status.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: '事件数',
      dataIndex: 'eventCount',
      key: 'eventCount',
      width: 100,
      sorter: (a: any, b: any) => a.eventCount - b.eventCount,
    },
    {
      title: '影响用户',
      dataIndex: 'userCount',
      key: 'userCount',
      width: 100,
      sorter: (a: any, b: any) => a.userCount - b.userCount,
    },
  ];

  // 最近告警
  const recentAlerts = [
    {
      id: '1',
      message: '错误率超过阈值 5%',
      time: '5 分钟前',
      level: 'error',
    },
    {
      id: '2',
      message: '新增 Issue 数量激增',
      time: '1 小时前',
      level: 'warning',
    },
    {
      id: '3',
      message: 'API 响应时间过长',
      time: '2 小时前',
      level: 'warning',
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      {/* 页面标题 */}
      <div style={{ marginBottom: 24 }}>
        <Title level={2} style={{ margin: 0 }}>
          项目总览
        </Title>
        <Text type="secondary">
          {currentProject?.name || '未选择项目'}
        </Text>
      </div>

      {/* 健康度评分卡 */}
      <Card style={{ marginBottom: 16 }}>
        <Row gutter={16} align="middle">
          <Col flex="200px">
            <div style={{ textAlign: 'center' }}>
              <Progress
                type="circle"
                percent={healthScore}
                strokeColor={getHealthColor(healthScore)}
                format={(percent) => (
                  <div>
                    <div style={{ fontSize: 32, fontWeight: 'bold' }}>
                      {percent}
                    </div>
                    <div style={{ fontSize: 14, color: '#999' }}>健康度</div>
                  </div>
                )}
                width={150}
              />
            </div>
          </Col>
          <Col flex="auto">
            <Space direction="vertical" size="middle" style={{ width: '100%' }}>
              <div>
                <Text strong style={{ fontSize: 16 }}>
                  系统健康状态
                </Text>
              </div>
              <div>
                <Text type="secondary">
                  {healthScore >= 80 && '系统运行良好，错误率在正常范围内'}
                  {healthScore >= 60 && healthScore < 80 && '系统存在一些问题，建议关注'}
                  {healthScore < 60 && '系统存在较多问题，需要立即处理'}
                </Text>
              </div>
              <Space>
                <Button
                  type="primary"
                  icon={<BugOutlined />}
                  onClick={() => navigate({ to: '/issues' })}
                >
                  查看问题
                </Button>
                <Button
                  icon={<WarningOutlined />}
                  onClick={() => navigate({ to: '/alerts' })}
                >
                  告警配置
                </Button>
              </Space>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* 核心指标卡片 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="错误总数"
              value={stats.totalErrors}
              prefix={<BugOutlined />}
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
              title="新增 Issue"
              value={stats.newIssues}
              prefix={<BugOutlined />}
              valueStyle={{
                color: stats.issueTrend > 0 ? '#cf1322' : '#3f8600',
              }}
              suffix={
                <span
                  style={{
                    fontSize: 14,
                    color: stats.issueTrend > 0 ? '#cf1322' : '#3f8600',
                  }}
                >
                  {stats.issueTrend > 0 ? (
                    <ArrowUpOutlined />
                  ) : (
                    <ArrowDownOutlined />
                  )}{' '}
                  {Math.abs(stats.issueTrend)}%
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
              title="错误率"
              value={stats.errorRate}
              prefix={<ThunderboltOutlined />}
              suffix="%"
              valueStyle={{
                color: stats.errorRate > 5 ? '#cf1322' : '#3f8600',
              }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        {/* 热点问题 */}
        <Col xs={24} lg={16}>
          <Card
            title={
              <Space>
                <RiseOutlined />
                <span>热点问题 Top 5</span>
              </Space>
            }
            extra={
              <Button
                type="link"
                onClick={() => navigate({ to: '/issues' })}
              >
                查看全部
              </Button>
            }
          >
            <Table
              columns={issueColumns}
              dataSource={topIssues}
              pagination={false}
              size="small"
            />
          </Card>
        </Col>

        {/* 最近告警 */}
        <Col xs={24} lg={8}>
          <Card
            title={
              <Space>
                <WarningOutlined />
                <span>最近告警</span>
              </Space>
            }
            extra={
              <Button
                type="link"
                onClick={() => navigate({ to: '/alerts' })}
              >
                查看全部
              </Button>
            }
          >
            <Space direction="vertical" style={{ width: '100%' }} size="middle">
              {recentAlerts.map((alert) => (
                <div
                  key={alert.id}
                  style={{
                    padding: 12,
                    background: '#f5f5f5',
                    borderRadius: 4,
                    borderLeft: `3px solid ${
                      alert.level === 'error' ? '#ff4d4f' : '#faad14'
                    }`,
                  }}
                >
                  <div style={{ marginBottom: 4 }}>
                    <Text strong>{alert.message}</Text>
                  </div>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    {alert.time}
                  </Text>
                </div>
              ))}
            </Space>
          </Card>
        </Col>
      </Row>
    </div>
  );
};
