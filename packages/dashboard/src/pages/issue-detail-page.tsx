/**
 * Issue 详情页 - 问题定位工作台
 * Issue Detail Page - Problem Locating Workbench
 * Issue 詳細ページ - 問題特定ワークベンチ
 * Issue 詳情頁 - 問題定位工作台
 */

import React, { useState, useEffect } from 'react';
import {
  Card,
  Descriptions,
  Tag,
  Table,
  Tabs,
  Space,
  Button,
  Select,
  Row,
  Col,
  Statistic,
  message,
  Spin,
} from 'antd';
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  UserOutlined,
  ClockCircleOutlined,
  BugOutlined,
  RobotOutlined,
} from '@ant-design/icons';
import { useParams } from '@tanstack/react-router';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchIssue, updateIssueStatus } from '../store/issue.slice';
import { StackTrace } from '../components/stack-trace';
import { BreadcrumbTimeline } from '../components/breadcrumb-timeline';
import { ISSUE_LEVEL_COLORS, ISSUE_STATUS_COLORS } from '../constants/issue';

export const IssueDetailPage: React.FC = () => {
  const { issueId } = useParams({ strict: false });
  const dispatch = useAppDispatch();
  const { currentIssue, loading } = useAppSelector((state) => state.issue);
  const { currentProject } = useAppSelector((state) => state.project);
  const [selectedEventIndex, setSelectedEventIndex] = useState(0);

  useEffect(() => {
    if (issueId && currentProject) {
      dispatch(fetchIssue({ projectId: currentProject.id, issueId }));
    }
  }, [issueId, currentProject, dispatch]);

  const handleStatusChange = async (status: string) => {
    if (!issueId || !currentProject) return;

    try {
      await dispatch(
        updateIssueStatus({
          projectId: currentProject.id,
          issueId,
          status,
        }),
      ).unwrap();
      message.success('状态更新成功');
    } catch (error) {
      message.error('状态更新失败');
    }
  };

  if (loading || !currentIssue) {
    return (
      <div style={{ textAlign: 'center', padding: 48 }}>
        <Spin size="large" />
      </div>
    );
  }

  // 模拟事件数据（实际应从 API 获取）
  const events = currentIssue.events || [
    {
      id: '1',
      userId: 'user-123',
      sessionId: 'session-abc',
      timestamp: new Date(currentIssue.lastSeen).getTime(),
      browser: 'Chrome 120',
      os: 'Windows 10',
      breadcrumbs: [
        {
          type: 'user',
          category: 'click',
          message: '点击按钮 "提交"',
          data: { selector: 'button.submit-btn' },
          timestamp: new Date(currentIssue.lastSeen).getTime() - 5000,
        },
        {
          type: 'navigation',
          category: 'navigation',
          message: '页面导航',
          data: { from: '/login', to: '/dashboard' },
          timestamp: new Date(currentIssue.lastSeen).getTime() - 10000,
        },
        {
          type: 'user',
          category: 'input',
          message: '输入字段 "email"',
          data: { selector: 'input[name="email"]' },
          timestamp: new Date(currentIssue.lastSeen).getTime() - 15000,
        },
        {
          type: 'http',
          category: 'http',
          message: 'API 请求',
          data: {
            method: 'POST',
            url: '/api/v1/auth/login',
            status: 200,
          },
          timestamp: new Date(currentIssue.lastSeen).getTime() - 20000,
        },
      ],
      stack: currentIssue.stack || `TypeError: Cannot read property 'data' of undefined
    at handleResponse (app.js:123:45)
    at XMLHttpRequest.onload (app.js:89:12)
    at processResponse (utils.js:56:10)`,
    },
  ];

  const selectedEvent = events[selectedEventIndex];

  const eventColumns = [
    {
      title: '时间',
      dataIndex: 'timestamp',
      key: 'timestamp',
      render: (t: number) => new Date(t).toLocaleString('zh-CN'),
    },
    { title: '用户 ID', dataIndex: 'userId', key: 'userId' },
    { title: '会话 ID', dataIndex: 'sessionId', key: 'sessionId' },
    { title: '浏览器', dataIndex: 'browser', key: 'browser' },
    { title: '操作系统', dataIndex: 'os', key: 'os' },
  ];

  return (
    <div style={{ padding: 24 }}>
      {/* 顶部操作栏 */}
      <Space style={{ marginBottom: 16 }}>
        <Button
          type="primary"
          icon={<CheckCircleOutlined />}
          onClick={() => handleStatusChange('resolved')}
          disabled={currentIssue.status === 'resolved'}
        >
          标记为已解决
        </Button>
        <Button
          icon={<CloseCircleOutlined />}
          onClick={() => handleStatusChange('ignored')}
          disabled={currentIssue.status === 'ignored'}
        >
          忽略
        </Button>
        <Button icon={<RobotOutlined />}>AI 分析</Button>
      </Space>

      {/* Issue 概览卡片 */}
      <Card style={{ marginBottom: 16 }}>
        <Row gutter={16}>
          <Col span={12}>
            <h2 style={{ marginBottom: 16 }}>
              <BugOutlined style={{ marginRight: 8 }} />
              {currentIssue.title}
            </h2>
            <Descriptions column={1}>
              <Descriptions.Item label="错误消息">
                {currentIssue.message}
              </Descriptions.Item>
              <Descriptions.Item label="级别">
                <Tag color={ISSUE_LEVEL_COLORS[currentIssue.level]}>
                  {currentIssue.level.toUpperCase()}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="类型">
                {currentIssue.type}
              </Descriptions.Item>
              <Descriptions.Item label="状态">
                <Tag color={ISSUE_STATUS_COLORS[currentIssue.status]}>
                  {currentIssue.status.toUpperCase()}
                </Tag>
              </Descriptions.Item>
              {currentIssue.environment && (
                <Descriptions.Item label="环境">
                  {currentIssue.environment}
                </Descriptions.Item>
              )}
              {currentIssue.appVersion && (
                <Descriptions.Item label="版本">
                  {currentIssue.appVersion}
                </Descriptions.Item>
              )}
            </Descriptions>
          </Col>
          <Col span={12}>
            <Row gutter={16}>
              <Col span={8}>
                <Statistic
                  title="事件数"
                  value={currentIssue.eventCount}
                  prefix={<BugOutlined />}
                />
              </Col>
              <Col span={8}>
                <Statistic
                  title="影响用户"
                  value={currentIssue.userCount}
                  prefix={<UserOutlined />}
                />
              </Col>
              <Col span={8}>
                <Statistic
                  title="首次发现"
                  value={new Date(currentIssue.firstSeen).toLocaleDateString()}
                  prefix={<ClockCircleOutlined />}
                />
              </Col>
            </Row>
            <div style={{ marginTop: 24 }}>
              <div style={{ marginBottom: 8, color: '#666' }}>最后发生</div>
              <div style={{ fontSize: 16 }}>
                {new Date(currentIssue.lastSeen).toLocaleString('zh-CN')}
              </div>
            </div>
          </Col>
        </Row>

        {/* AI 摘要 */}
        {currentIssue.aiSummary && (
          <div
            style={{
              marginTop: 16,
              padding: 12,
              background: '#f0f5ff',
              borderRadius: 4,
              borderLeft: '3px solid #1890ff',
            }}
          >
            <div style={{ fontWeight: 500, marginBottom: 8 }}>
              <RobotOutlined style={{ marginRight: 8 }} />
              AI 分析摘要
            </div>
            <div>{currentIssue.aiSummary}</div>
          </div>
        )}
      </Card>

      {/* 事件选择器 */}
      {events.length > 1 && (
        <Card size="small" style={{ marginBottom: 16 }}>
          <Space>
            <span>选择事件：</span>
            <Select
              style={{ width: 300 }}
              value={selectedEventIndex}
              onChange={setSelectedEventIndex}
              options={events.map((event, index) => ({
                label: `事件 ${index + 1} - ${new Date(event.timestamp).toLocaleString('zh-CN')}`,
                value: index,
              }))}
            />
            <span style={{ color: '#999' }}>
              共 {events.length} 个事件
            </span>
          </Space>
        </Card>
      )}

      {/* 详情 Tabs */}
      <Tabs
        defaultActiveKey="stack"
        items={[
          {
            key: 'stack',
            label: '堆栈跟踪',
            children: (
              <StackTrace
                stack={selectedEvent.stack}
                resolvedStack={selectedEvent.resolvedStack}
              />
            ),
          },
          {
            key: 'breadcrumbs',
            label: '行为轨迹',
            children: (
              <Card>
                <BreadcrumbTimeline
                  breadcrumbs={selectedEvent.breadcrumbs}
                  errorTimestamp={selectedEvent.timestamp}
                />
              </Card>
            ),
          },
          {
            key: 'events',
            label: `所有事件 (${events.length})`,
            children: (
              <Table
                columns={eventColumns}
                dataSource={events}
                rowKey="id"
                pagination={false}
              />
            ),
          },
          {
            key: 'environment',
            label: '环境信息',
            children: (
              <Card>
                <Descriptions column={2}>
                  <Descriptions.Item label="浏览器">
                    {selectedEvent.browser}
                  </Descriptions.Item>
                  <Descriptions.Item label="操作系统">
                    {selectedEvent.os}
                  </Descriptions.Item>
                  <Descriptions.Item label="用户 ID">
                    {selectedEvent.userId}
                  </Descriptions.Item>
                  <Descriptions.Item label="会话 ID">
                    {selectedEvent.sessionId}
                  </Descriptions.Item>
                </Descriptions>
              </Card>
            ),
          },
        ]}
      />
    </div>
  );
};
