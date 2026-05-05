import React from 'react';
import { Card, Descriptions, Tag, Timeline, Table, Tabs, Space, Button } from 'antd';
import { useParams } from '@tanstack/react-router';

const levelColors: Record<string, string> = {
  fatal: 'red',
  error: 'orange',
  warning: 'gold',
  info: 'blue',
};

export const IssueDetailPage: React.FC = () => {
  const { issueId } = useParams({ strict: false });

  const issue = {
    id: issueId,
    title: 'TypeError: Cannot read property of undefined',
    message: "Cannot read property 'data' of undefined",
    level: 'error',
    type: 'error',
    status: 'open',
    eventCount: 245,
    userCount: 89,
    firstSeen: '2026-05-01T10:30:00Z',
    lastSeen: '2026-05-05T09:15:00Z',
    stack: `TypeError: Cannot read property 'data' of undefined
    at handleResponse (app.js:123:45)
    at XMLHttpRequest.onload (app.js:89:12)`,
  };

  const breadcrumbs = [
    { type: 'click', message: 'Clicked button "Submit"', timestamp: '09:14:55' },
    { type: 'navigation', message: 'Navigated to /dashboard', timestamp: '09:14:50' },
    { type: 'input', message: 'Input in field "email"', timestamp: '09:14:45' },
    { type: 'click', message: 'Clicked link "Login"', timestamp: '09:14:40' },
  ];

  const events = [
    {
      id: '1',
      userId: 'user-123',
      sessionId: 'session-abc',
      timestamp: '2026-05-05T09:15:00Z',
      browser: 'Chrome 120',
      os: 'Windows 10',
    },
    {
      id: '2',
      userId: 'user-456',
      sessionId: 'session-def',
      timestamp: '2026-05-05T08:30:00Z',
      browser: 'Firefox 121',
      os: 'macOS 14',
    },
  ];

  const eventColumns = [
    { title: 'Time', dataIndex: 'timestamp', key: 'timestamp', render: (t: string) => new Date(t).toLocaleString() },
    { title: 'User ID', dataIndex: 'userId', key: 'userId' },
    { title: 'Session ID', dataIndex: 'sessionId', key: 'sessionId' },
    { title: 'Browser', dataIndex: 'browser', key: 'browser' },
    { title: 'OS', dataIndex: 'os', key: 'os' },
  ];

  return (
    <div>
      <Space style={{ marginBottom: 16 }}>
        <Button type="primary">Mark as Resolved</Button>
        <Button>Ignore</Button>
        <Button>Assign</Button>
      </Space>

      <Card title="Issue Details" style={{ marginBottom: 16 }}>
        <Descriptions column={2}>
          <Descriptions.Item label="Title">{issue.title}</Descriptions.Item>
          <Descriptions.Item label="Level">
            <Tag color={levelColors[issue.level]}>{issue.level.toUpperCase()}</Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Type">{issue.type}</Descriptions.Item>
          <Descriptions.Item label="Status">
            <Tag color={issue.status === 'open' ? 'red' : 'green'}>{issue.status.toUpperCase()}</Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Events">{issue.eventCount}</Descriptions.Item>
          <Descriptions.Item label="Users">{issue.userCount}</Descriptions.Item>
          <Descriptions.Item label="First Seen">{new Date(issue.firstSeen).toLocaleString()}</Descriptions.Item>
          <Descriptions.Item label="Last Seen">{new Date(issue.lastSeen).toLocaleString()}</Descriptions.Item>
        </Descriptions>
      </Card>

      <Card title="Error Message" style={{ marginBottom: 16 }}>
        <p>{issue.message}</p>
        <pre style={{ background: '#f5f5f5', padding: 16, borderRadius: 4, overflow: 'auto' }}>
          {issue.stack}
        </pre>
      </Card>

      <Tabs
        items={[
          {
            key: 'breadcrumbs',
            label: 'Breadcrumbs',
            children: (
              <Timeline
                items={breadcrumbs.map((b) => ({
                  children: (
                    <div>
                      <div style={{ fontWeight: 500 }}>{b.message}</div>
                      <div style={{ color: '#999', fontSize: 12 }}>{b.timestamp}</div>
                    </div>
                  ),
                }))}
              />
            ),
          },
          {
            key: 'events',
            label: `Events (${events.length})`,
            children: <Table columns={eventColumns} dataSource={events} rowKey="id" pagination={false} />,
          },
        ]}
      />
    </div>
  );
};
