import React, { useState } from 'react';
import { Card, Form, Input, Select, Switch, Button, Space, Table, Tag, message, Divider } from 'antd';
import { PlusOutlined, DeleteOutlined, EditOutlined } from '@ant-design/icons';

const { Option } = Select;

interface AlertRule {
  id: string;
  name: string;
  type: string;
  threshold?: number;
  timeWindow?: number;
  channels: string[];
  enabled: boolean;
}

export const AlertConfigPage: React.FC = () => {
  const [rules, setRules] = useState<AlertRule[]>([
    {
      id: '1',
      name: 'High Error Count',
      type: 'error_count',
      threshold: 100,
      timeWindow: 3600,
      channels: ['email', 'webhook'],
      enabled: true,
    },
    {
      id: '2',
      name: 'New Fatal Error',
      type: 'new_error',
      channels: ['email', 'wechat', 'dingtalk'],
      enabled: true,
    },
  ]);

  const [showForm, setShowForm] = useState(false);
  const [form] = Form.useForm();

  const ruleTypes = [
    { value: 'error_count', label: 'Error Count Threshold' },
    { value: 'error_rate', label: 'Error Rate Threshold' },
    { value: 'new_error', label: 'New Error Alert' },
    { value: 'regression', label: 'Error Regression' },
  ];

  const channels = [
    { value: 'email', label: 'Email' },
    { value: 'webhook', label: 'Webhook' },
    { value: 'wechat', label: 'WeChat Work' },
    { value: 'dingtalk', label: 'DingTalk' },
  ];

  const columns = [
    {
      title: 'Rule Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      render: (type: string) => {
        const rule = ruleTypes.find((r) => r.value === type);
        return rule?.label || type;
      },
    },
    {
      title: 'Threshold',
      dataIndex: 'threshold',
      key: 'threshold',
      render: (val: number) => val || '-',
    },
    {
      title: 'Channels',
      dataIndex: 'channels',
      key: 'channels',
      render: (channels: string[]) => (
        <>
          {channels.map((ch) => (
            <Tag key={ch} color="blue">
              {ch}
            </Tag>
          ))}
        </>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'enabled',
      key: 'enabled',
      render: (enabled: boolean) => (
        <Tag color={enabled ? 'green' : 'red'}>
          {enabled ? 'Enabled' : 'Disabled'}
        </Tag>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: AlertRule) => (
        <Space>
          <Button type="link" icon={<EditOutlined />} size="small">
            Edit
          </Button>
          <Button
            type="link"
            danger
            icon={<DeleteOutlined />}
            size="small"
            onClick={() => handleDelete(record.id)}
          >
            Delete
          </Button>
        </Space>
      ),
    },
  ];

  const handleDelete = (id: string) => {
    setRules(rules.filter((r) => r.id !== id));
    message.success('Alert rule deleted');
  };

  const handleSubmit = (values: any) => {
    const newRule: AlertRule = {
      id: Date.now().toString(),
      ...values,
    };
    setRules([...rules, newRule]);
    setShowForm(false);
    form.resetFields();
    message.success('Alert rule created');
  };

  const testAlert = async (channel: string) => {
    const hide = message.loading(`Sending test alert to ${channel}...`);
    try {
      // TODO: Replace with actual API call
      await Promise.resolve();
      hide();
      message.success(`Test alert sent to ${channel}`);
    } catch (error) {
      hide();
      message.error('Failed to send test alert');
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1>Alert Configuration</h1>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setShowForm(!showForm)}>
          New Alert Rule
        </Button>
      </div>

      {showForm && (
        <Card title="Create Alert Rule" style={{ marginBottom: 24 }}>
          <Form form={form} layout="vertical" onFinish={handleSubmit}>
            <Form.Item name="name" label="Rule Name" rules={[{ required: true }]}>
              <Input placeholder="e.g., High Error Count Alert" />
            </Form.Item>

            <Form.Item name="type" label="Alert Type" rules={[{ required: true }]}>
              <Select placeholder="Select alert type">
                {ruleTypes.map((type) => (
                  <Option key={type.value} value={type.value}>
                    {type.label}
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item name="threshold" label="Threshold (optional)">
              <Input type="number" placeholder="e.g., 100" />
            </Form.Item>

            <Form.Item name="timeWindow" label="Time Window (seconds, optional)">
              <Input type="number" placeholder="e.g., 3600" />
            </Form.Item>

            <Form.Item name="channels" label="Notification Channels" rules={[{ required: true }]}>
              <Select mode="multiple" placeholder="Select channels">
                {channels.map((ch) => (
                  <Option key={ch.value} value={ch.value}>
                    {ch.label}
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item name="enabled" label="Enabled" valuePropName="checked" initialValue={true}>
              <Switch />
            </Form.Item>

            <Form.Item>
              <Space>
                <Button type="primary" htmlType="submit">
                  Create
                </Button>
                <Button onClick={() => setShowForm(false)}>Cancel</Button>
              </Space>
            </Form.Item>
          </Form>
        </Card>
      )}

      <Card title="Alert Rules">
        <Table columns={columns} dataSource={rules} rowKey="id" />
      </Card>

      <Divider />

      <Card title="Notification Channels">
        <Space direction="vertical" style={{ width: '100%' }} size="large">
          {channels.map((ch) => (
            <Card key={ch.value} size="small">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <strong>{ch.label}</strong>
                  <div style={{ color: '#999', fontSize: 12 }}>
                    {ch.value === 'email' && 'Configure SMTP settings in .env'}
                    {ch.value === 'webhook' && 'Set WEBHOOK_URL in .env'}
                    {ch.value === 'wechat' && 'Set WECHAT_WEBHOOK_URL in .env'}
                    {ch.value === 'dingtalk' && 'Set DINGTALK_WEBHOOK_URL in .env'}
                  </div>
                </div>
                <Button size="small" onClick={() => testAlert(ch.value)}>
                  Test
                </Button>
              </div>
            </Card>
          ))}
        </Space>
      </Card>
    </div>
  );
};
