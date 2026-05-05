/**
 * 项目列表页
 * Project List Page
 * プロジェクトリストページ
 * 專案列表頁
 */

import React, { useState, useEffect } from 'react';
import {
  Card,
  Row,
  Col,
  Button,
  Modal,
  Form,
  Input,
  message,
  Statistic,
  Tag,
  Space,
  Empty,
  Spin,
  Typography,
} from 'antd';
import {
  PlusOutlined,
  AppstoreOutlined,
  BugOutlined,
  WarningOutlined,
  CopyOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import { useNavigate } from '@tanstack/react-router';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchProjects, createProject, setCurrentProject } from '../store/project.slice';

const { Text, Paragraph } = Typography;

export const ProjectListPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { projects, loading } = useAppSelector((state) => state.project);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    dispatch(fetchProjects());
  }, [dispatch]);

  const handleCreateProject = async (values: { name: string; description?: string }) => {
    try {
      await dispatch(createProject(values)).unwrap();
      message.success('项目创建成功');
      setIsModalOpen(false);
      form.resetFields();
    } catch (error) {
      message.error('项目创建失败');
    }
  };

  const handleCopyApiKey = (apiKey: string) => {
    navigator.clipboard.writeText(apiKey);
    message.success('API Key 已复制到剪贴板');
  };

  const handleSelectProject = (project: any) => {
    dispatch(setCurrentProject(project));
    navigate({ to: '/dashboard' });
  };

  if (loading && projects.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: 48 }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div style={{ padding: 24 }}>
      {/* 页面头部 */}
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 24 }}>
            <AppstoreOutlined style={{ marginRight: 8 }} />
            我的项目
          </h1>
          <Text type="secondary">管理您的监控项目</Text>
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          size="large"
          onClick={() => setIsModalOpen(true)}
        >
          创建项目
        </Button>
      </div>

      {/* 项目列表 */}
      {projects.length === 0 ? (
        <Card>
          <Empty
            description="暂无项目"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          >
            <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsModalOpen(true)}>
              创建第一个项目
            </Button>
          </Empty>
        </Card>
      ) : (
        <Row gutter={[16, 16]}>
          {projects.map((project) => (
            <Col key={project.id} xs={24} sm={12} lg={8} xl={6}>
              <Card
                hoverable
                onClick={() => handleSelectProject(project)}
                actions={[
                  <Button
                    type="text"
                    icon={<CopyOutlined />}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCopyApiKey(project.apiKey);
                    }}
                  >
                    复制 API Key
                  </Button>,
                  <Button
                    type="text"
                    icon={<SettingOutlined />}
                    onClick={(e) => {
                      e.stopPropagation();
                      dispatch(setCurrentProject(project));
                      navigate({ to: '/settings' });
                    }}
                  >
                    设置
                  </Button>,
                ]}
              >
                <div style={{ marginBottom: 16 }}>
                  <h3 style={{ margin: 0, marginBottom: 8 }}>{project.name}</h3>
                  {project.description && (
                    <Paragraph
                      type="secondary"
                      ellipsis={{ rows: 2 }}
                      style={{ marginBottom: 0, fontSize: 12 }}
                    >
                      {project.description}
                    </Paragraph>
                  )}
                </div>

                {/* 项目统计 */}
                <Row gutter={16} style={{ marginBottom: 12 }}>
                  <Col span={12}>
                    <Statistic
                      title="问题数"
                      value={project._count?.issues || 0}
                      prefix={<BugOutlined />}
                      valueStyle={{ fontSize: 20 }}
                    />
                  </Col>
                  <Col span={12}>
                    <Statistic
                      title="错误率"
                      value={project.errorRate || 0}
                      suffix="%"
                      prefix={<WarningOutlined />}
                      valueStyle={{
                        fontSize: 20,
                        color: (project.errorRate || 0) > 5 ? '#ff4d4f' : '#52c41a',
                      }}
                    />
                  </Col>
                </Row>

                {/* API Key 预览 */}
                <div
                  style={{
                    background: '#f5f5f5',
                    padding: 8,
                    borderRadius: 4,
                    fontSize: 12,
                  }}
                >
                  <Text type="secondary">API Key: </Text>
                  <Text code style={{ fontSize: 11 }}>
                    {project.apiKey.substring(0, 20)}...
                  </Text>
                </div>

                {/* 创建时间 */}
                <div style={{ marginTop: 12, fontSize: 12, color: '#999' }}>
                  创建于 {new Date(project.createdAt).toLocaleDateString('zh-CN')}
                </div>
              </Card>
            </Col>
          ))}
        </Row>
      )}

      {/* 创建项目对话框 */}
      <Modal
        title="创建新项目"
        open={isModalOpen}
        onCancel={() => {
          setIsModalOpen(false);
          form.resetFields();
        }}
        onOk={() => form.submit()}
        okText="创建"
        cancelText="取消"
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleCreateProject}
        >
          <Form.Item
            label="项目名称"
            name="name"
            rules={[
              { required: true, message: '请输入项目名称' },
              { min: 2, message: '项目名称至少 2 个字符' },
              { max: 50, message: '项目名称最多 50 个字符' },
            ]}
          >
            <Input placeholder="例如：我的网站" />
          </Form.Item>

          <Form.Item
            label="项目描述"
            name="description"
            rules={[
              { max: 200, message: '项目描述最多 200 个字符' },
            ]}
          >
            <Input.TextArea
              rows={3}
              placeholder="简要描述这个项目的用途（可选）"
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};
