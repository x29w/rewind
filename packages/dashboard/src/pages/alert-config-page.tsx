/**
 * 告警配置页
 * Alert Configuration Page
 * アラート設定ページ
 * 告警配置頁
 */

import React, { useState } from 'react';
import {
  Card,
  Form,
  Input,
  Select,
  Switch,
  Button,
  Space,
  Table,
  Tag,
  message,
  Modal,
  InputNumber,
  Typography,
} from 'antd';
import {
  PlusOutlined,
  DeleteOutlined,
  EditOutlined,
  BellOutlined,
  MailOutlined,
  ApiOutlined,
  WechatOutlined,
  DingdingOutlined,
} from '@ant-design/icons';
import { testAlertService } from '../api/alert';

const { Option } = Select;
const { Text } = Typography;

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
      name: '错误数量过高',
      type: 'error_count',
      threshold: 100,
      timeWindow: 3600,
      channels: ['email', 'webhook'],
      enabled: true,
    },
    {
      id: '2',
      name: '新增致命错误',
      type: 'new_error',
      channels: ['email', 'wechat', 'dingtalk'],
      enabled: true,
    },
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<AlertRule | null>(null);
  const [form] = Form.useForm();

  const ruleTypes = [
    { value: 'error_count', label: '错误数量阈值' },
    { value: 'error_rate', label: '错误率阈值' },
    { value: 'new_error', label: '新增错误告警' },
    { value: 'regression', label: '错误回归告警' },
  ];

  const channels = [
    { value: 'email', label: '邮件', icon: <MailOutlined /> },
    { value: 'webhook', label: 'Webhook', icon: <ApiOutlined /> },
    { value: 'wechat', label: '企业微信', icon: <WechatOutlined /> },
    { value: 'dingtalk', label: '钉钉', icon: <DingdingOutlined /> },
  ];

  const columns = [
    {
      title: '规则名称',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      render: (type: string) => {
        const rule = ruleTypes.find((r) => r.value === type);
        return rule?.label || type;
      },
    },
    {
      title: '阈值',
      dataIndex: 'threshold',
      key: 'threshold',
      render: (val: number) => val || '-',
    },
    {
      title: '时间窗口',
      dataIndex: 'timeWindow',
      key: 'timeWindow',
      render: (val: number) => (val ? `${val / 60} 分钟` : '-'),
    },
    {
      title: '通知渠道',
      dataIndex: 'channels',
      key: 'channels',
      render: (channelList: string[]) => (
        <>
          {channelList.map((ch) => {
            const channel = channels.find((c) => c.value === ch);
            return (
              <Tag key={ch} color="blue">
                {channel?.label || ch}
              </Tag>
            );
          })}
        </>
      ),
    },
    {
      title: '状态',
      dataIndex: 'enabled',
      key: 'enabled',
      render: (enabled: boolean) => (
        <Tag color={enabled ? 'green' : 'red'}>
          {enabled ? '启用' : '禁用'}
        </Tag>
      ),
    },
    {
      title: '操作',
      key: 'actions',
      render: (_: any, record: AlertRule) => (
        <Space>
          <Button
            type="link"
            icon={<EditOutlined />}
            size="small"
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
          <Button
            type="link"
            danger
            icon={<DeleteOutlined />}
            size="small"
            onClick={() => handleDelete(record.id)}
          >
            删除
          </Button>
        </Space>
      ),
    },
  ];

  const handleEdit = (rule: AlertRule) => {
    setEditingRule(rule);
    form.setFieldsValue(rule);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除这条告警规则吗？',
      onOk: () => {
        setRules(rules.filter((r) => r.id !== id));
        message.success('告警规则已删除');
      },
    });
  };

  const handleSubmit = (values: any) => {
    if (editingRule) {
      // 更新规则
      setRules(
        rules.map((r) =>
          r.id === editingRule.id ? { ...editingRule, ...values } : r,
        ),
      );
      message.success('告警规则已更新');
    } else {
      // 创建新规则
      const newRule: AlertRule = {
        id: Date.now().toString(),
        ...values,
      };
      setRules([...rules, newRule]);
      message.success('告警规则已创建');
    }
    setIsModalOpen(false);
    setEditingRule(null);
    form.resetFields();
  };

  const handleTestAlert = async (channel: string) => {
    const hide = message.loading(`正在发送测试告警到 ${channel}...`);
    try {
      await testAlertService({ data: { channel } });
      hide();
      message.success(`测试告警已发送到 ${channel}`);
    } catch (error) {
      hide();
      message.error('发送测试告警失败');
    }
  };

  return (
    <div style={{ padding: 24 }}>
      {/* 页面头部 */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 24,
        }}
      >
        <div>
          <h1 style={{ margin: 0, fontSize: 24 }}>
            <BellOutlined style={{ marginRight: 8 }} />
            告警配置
          </h1>
          <Text type="secondary">配置告警规则和通知渠道</Text>
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          size="large"
          onClick={() => {
            setEditingRule(null);
            form.resetFields();
            setIsModalOpen(true);
          }}
        >
          新建规则
        </Button>
      </div>

      {/* 告警规则列表 */}
      <Card title="告警规则" style={{ marginBottom: 24 }}>
        <Table columns={columns} dataSource={rules} rowKey="id" />
      </Card>

      {/* 通知渠道配置 */}
      <Card title="通知渠道">
        <Space direction="vertical" style={{ width: '100%' }} size="large">
          {channels.map((ch) => (
            <Card key={ch.value} size="small">
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div>
                  <Space>
                    {ch.icon}
                    <strong>{ch.label}</strong>
                  </Space>
                  <div style={{ color: '#999', fontSize: 12, marginTop: 4 }}>
                    {ch.value === 'email' && '在 .env 中配置 SMTP 设置'}
                    {ch.value === 'webhook' && '在 .env 中设置 WEBHOOK_URL'}
                    {ch.value === 'wechat' &&
                      '在 .env 中设置 WECHAT_WEBHOOK_URL'}
                    {ch.value === 'dingtalk' &&
                      '在 .env 中设置 DINGTALK_WEBHOOK_URL'}
                  </div>
                </div>
                <Button size="small" onClick={() => handleTestAlert(ch.value)}>
                  测试
                </Button>
              </div>
            </Card>
          ))}
        </Space>
      </Card>

      {/* 创建/编辑规则对话框 */}
      <Modal
        title={editingRule ? '编辑告警规则' : '创建告警规则'}
        open={isModalOpen}
        onCancel={() => {
          setIsModalOpen(false);
          setEditingRule(null);
          form.resetFields();
        }}
        onOk={() => form.submit()}
        okText={editingRule ? '更新' : '创建'}
        cancelText="取消"
        width={600}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            name="name"
            label="规则名称"
            rules={[
              { required: true, message: '请输入规则名称' },
              { min: 2, message: '规则名称至少 2 个字符' },
            ]}
          >
            <Input placeholder="例如：错误数量过高" />
          </Form.Item>

          <Form.Item
            name="type"
            label="告警类型"
            rules={[{ required: true, message: '请选择告警类型' }]}
          >
            <Select placeholder="选择告警类型">
              {ruleTypes.map((type) => (
                <Option key={type.value} value={type.value}>
                  {type.label}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            noStyle
            shouldUpdate={(prevValues, currentValues) =>
              prevValues.type !== currentValues.type
            }
          >
            {({ getFieldValue }) => {
              const type = getFieldValue('type');
              if (type === 'error_count' || type === 'error_rate') {
                return (
                  <>
                    <Form.Item
                      name="threshold"
                      label="阈值"
                      rules={[{ required: true, message: '请输入阈值' }]}
                    >
                      <InputNumber
                        style={{ width: '100%' }}
                        min={1}
                        placeholder={
                          type === 'error_rate' ? '例如：5（%）' : '例如：100'
                        }
                      />
                    </Form.Item>

                    <Form.Item
                      name="timeWindow"
                      label="时间窗口（秒）"
                      rules={[{ required: true, message: '请输入时间窗口' }]}
                    >
                      <InputNumber
                        style={{ width: '100%' }}
                        min={60}
                        placeholder="例如：3600（1小时）"
                      />
                    </Form.Item>
                  </>
                );
              }
              return null;
            }}
          </Form.Item>

          <Form.Item
            name="channels"
            label="通知渠道"
            rules={[{ required: true, message: '请选择至少一个通知渠道' }]}
          >
            <Select mode="multiple" placeholder="选择通知渠道">
              {channels.map((ch) => (
                <Option key={ch.value} value={ch.value}>
                  <Space>
                    {ch.icon}
                    {ch.label}
                  </Space>
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="enabled"
            label="启用规则"
            valuePropName="checked"
            initialValue={true}
          >
            <Switch />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};
