/**
 * 设置页
 * Settings Page
 * 設定ページ
 * 設定頁
 */

import React, { useState } from 'react';
import {
  Card,
  Tabs,
  Form,
  Input,
  Button,
  Space,
  Typography,
  Divider,
  message,
  Table,
  Tag,
  Upload,
  Modal,
  Alert,
} from 'antd';
import {
  SettingOutlined,
  SaveOutlined,
  CopyOutlined,
  UploadOutlined,
  DeleteOutlined,
  CodeOutlined,
  InfoCircleOutlined,
} from '@ant-design/icons';
import { useAppSelector } from '../store/hooks';

const { TextArea } = Input;
const { Text, Title, Paragraph } = Typography;
const { TabPane } = Tabs;

interface SourcemapFile {
  id: string;
  filename: string;
  version: string;
  uploadTime: string;
  size: number;
}

export const SettingsPage: React.FC = () => {
  const { currentProject } = useAppSelector((state) => state.project);
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [sourcemaps, setSourcemaps] = useState<SourcemapFile[]>([
    {
      id: '1',
      filename: 'main.js.map',
      version: '1.0.0',
      uploadTime: '2026-05-05T10:00:00Z',
      size: 2048576,
    },
    {
      id: '2',
      filename: 'vendor.js.map',
      version: '1.0.0',
      uploadTime: '2026-05-05T10:00:00Z',
      size: 5242880,
    },
  ]);

  const handleSaveProject = async (values: any) => {
    setLoading(true);
    try {
      // TODO: 调用 API 更新项目信息
      // await updateProjectService({ id: currentProject.id, data: values });
      message.success('项目信息已更新');
    } catch (error) {
      message.error('更新失败');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyApiKey = () => {
    if (currentProject?.apiKey) {
      navigator.clipboard.writeText(currentProject.apiKey);
      message.success('API Key 已复制到剪贴板');
    }
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    message.success('代码已复制到剪贴板');
  };

  const handleDeleteSourcemap = (id: string) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除这个 SourceMap 文件吗？',
      onOk: () => {
        setSourcemaps(sourcemaps.filter((s) => s.id !== id));
        message.success('SourceMap 已删除');
      },
    });
  };

  const sourcemapColumns = [
    {
      title: '文件名',
      dataIndex: 'filename',
      key: 'filename',
    },
    {
      title: '版本',
      dataIndex: 'version',
      key: 'version',
      render: (version: string) => <Tag color="blue">{version}</Tag>,
    },
    {
      title: '大小',
      dataIndex: 'size',
      key: 'size',
      render: (size: number) => `${(size / 1024 / 1024).toFixed(2)} MB`,
    },
    {
      title: '上传时间',
      dataIndex: 'uploadTime',
      key: 'uploadTime',
      render: (time: string) => new Date(time).toLocaleString('zh-CN'),
    },
    {
      title: '操作',
      key: 'actions',
      render: (_: any, record: SourcemapFile) => (
        <Button
          type="link"
          danger
          icon={<DeleteOutlined />}
          onClick={() => handleDeleteSourcemap(record.id)}
        >
          删除
        </Button>
      ),
    },
  ];

  const installCode = `npm install @rewind-dev/sdk
# 或
yarn add @rewind-dev/sdk
# 或
pnpm add @rewind-dev/sdk`;

  const initCode = `import { RewindClient } from '@rewind-dev/sdk';

const rewind = new RewindClient({
  apiKey: '${currentProject?.apiKey || 'YOUR_API_KEY'}',
  appVersion: '1.0.0',
  environment: 'production',
});

// 初始化
rewind.init();`;

  const vueCode = `// main.js
import { RewindClient } from '@rewind-dev/sdk';

const rewind = new RewindClient({
  apiKey: '${currentProject?.apiKey || 'YOUR_API_KEY'}',
  appVersion: '1.0.0',
  environment: 'production',
});

const app = createApp(App);
rewind.init();
app.mount('#app');`;

  const reactCode = `// index.jsx
import { RewindClient } from '@rewind-dev/sdk';

const rewind = new RewindClient({
  apiKey: '${currentProject?.apiKey || 'YOUR_API_KEY'}',
  appVersion: '1.0.0',
  environment: 'production',
});

rewind.init();

ReactDOM.render(<App />, document.getElementById('root'));`;

  return (
    <div style={{ padding: 24 }}>
      {/* 页面头部 */}
      <div style={{ marginBottom: 24 }}>
        <Title level={2} style={{ margin: 0 }}>
          <SettingOutlined style={{ marginRight: 8 }} />
          项目设置
        </Title>
        <Text type="secondary">
          {currentProject?.name || '未选择项目'}
        </Text>
      </div>

      <Tabs defaultActiveKey="info">
        {/* 项目信息 */}
        <TabPane tab="项目信息" key="info">
          <Card>
            <Form
              form={form}
              layout="vertical"
              onFinish={handleSaveProject}
              initialValues={{
                name: currentProject?.name,
                description: currentProject?.description,
              }}
            >
              <Form.Item
                label="项目名称"
                name="name"
                rules={[
                  { required: true, message: '请输入项目名称' },
                  { min: 2, message: '项目名称至少 2 个字符' },
                ]}
              >
                <Input placeholder="例如：我的网站" />
              </Form.Item>

              <Form.Item
                label="项目描述"
                name="description"
                rules={[{ max: 200, message: '项目描述最多 200 个字符' }]}
              >
                <TextArea
                  rows={3}
                  placeholder="简要描述这个项目的用途"
                />
              </Form.Item>

              <Divider />

              <Form.Item label="API Key">
                <Space.Compact style={{ width: '100%' }}>
                  <Input
                    value={currentProject?.apiKey}
                    readOnly
                    addonBefore={<CodeOutlined />}
                  />
                  <Button
                    icon={<CopyOutlined />}
                    onClick={handleCopyApiKey}
                  >
                    复制
                  </Button>
                </Space.Compact>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  请妥善保管 API Key，不要泄露给他人
                </Text>
              </Form.Item>

              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  icon={<SaveOutlined />}
                  loading={loading}
                >
                  保存更改
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </TabPane>

        {/* SDK 接入指引 */}
        <TabPane tab="SDK 接入" key="sdk">
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            <Alert
              message="快速开始"
              description="按照以下步骤将 Rewind SDK 集成到您的项目中"
              type="info"
              showIcon
              icon={<InfoCircleOutlined />}
            />

            <Card title="1. 安装 SDK">
              <pre
                style={{
                  background: '#f5f5f5',
                  padding: 16,
                  borderRadius: 4,
                  overflow: 'auto',
                }}
              >
                {installCode}
              </pre>
              <Button
                size="small"
                icon={<CopyOutlined />}
                onClick={() => handleCopyCode(installCode)}
              >
                复制代码
              </Button>
            </Card>

            <Card title="2. 初始化 SDK">
              <Tabs>
                <TabPane tab="原生 JavaScript" key="js">
                  <pre
                    style={{
                      background: '#f5f5f5',
                      padding: 16,
                      borderRadius: 4,
                      overflow: 'auto',
                    }}
                  >
                    {initCode}
                  </pre>
                  <Button
                    size="small"
                    icon={<CopyOutlined />}
                    onClick={() => handleCopyCode(initCode)}
                  >
                    复制代码
                  </Button>
                </TabPane>
                <TabPane tab="Vue" key="vue">
                  <pre
                    style={{
                      background: '#f5f5f5',
                      padding: 16,
                      borderRadius: 4,
                      overflow: 'auto',
                    }}
                  >
                    {vueCode}
                  </pre>
                  <Button
                    size="small"
                    icon={<CopyOutlined />}
                    onClick={() => handleCopyCode(vueCode)}
                  >
                    复制代码
                  </Button>
                </TabPane>
                <TabPane tab="React" key="react">
                  <pre
                    style={{
                      background: '#f5f5f5',
                      padding: 16,
                      borderRadius: 4,
                      overflow: 'auto',
                    }}
                  >
                    {reactCode}
                  </pre>
                  <Button
                    size="small"
                    icon={<CopyOutlined />}
                    onClick={() => handleCopyCode(reactCode)}
                  >
                    复制代码
                  </Button>
                </TabPane>
              </Tabs>
            </Card>

            <Card title="3. 配置选项">
              <Space direction="vertical" style={{ width: '100%' }}>
                <Paragraph>
                  <Text strong>apiKey</Text> (必填): 项目的 API Key
                </Paragraph>
                <Paragraph>
                  <Text strong>appVersion</Text> (可选): 应用版本号，用于版本对比
                </Paragraph>
                <Paragraph>
                  <Text strong>environment</Text> (可选): 运行环境（development / production）
                </Paragraph>
                <Paragraph>
                  <Text strong>sampleRate</Text> (可选): 采样率，默认 1.0（100%）
                </Paragraph>
                <Paragraph>
                  <Text strong>maxBreadcrumbs</Text> (可选): 最大行为记录数，默认 50
                </Paragraph>
              </Space>
            </Card>

            <Card title="4. 验证集成">
              <Paragraph>
                集成完成后，刷新您的应用页面，SDK 会自动开始采集数据。
              </Paragraph>
              <Paragraph>
                您可以在「问题管理」页面查看采集到的错误信息。
              </Paragraph>
              <Button type="primary">查看问题列表</Button>
            </Card>
          </Space>
        </TabPane>

        {/* SourceMap 管理 */}
        <TabPane tab="SourceMap 管理" key="sourcemap">
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            <Alert
              message="SourceMap 说明"
              description="上传 SourceMap 文件可以将压缩后的堆栈信息还原为源代码位置，帮助您更快定位问题。"
              type="info"
              showIcon
            />

            <Card
              title="上传 SourceMap"
              extra={
                <Upload
                  accept=".map"
                  showUploadList={false}
                  beforeUpload={(file) => {
                    message.success(`${file.name} 上传成功`);
                    return false;
                  }}
                >
                  <Button type="primary" icon={<UploadOutlined />}>
                    上传文件
                  </Button>
                </Upload>
              }
            >
              <Paragraph>
                <Text type="secondary">
                  支持的文件格式：.map（JavaScript Source Map）
                </Text>
              </Paragraph>
              <Paragraph>
                <Text type="secondary">
                  建议在构建时自动上传 SourceMap，可以使用我们提供的 CLI 工具或 Webpack 插件
                </Text>
              </Paragraph>
            </Card>

            <Card title="已上传的 SourceMap">
              <Table
                columns={sourcemapColumns}
                dataSource={sourcemaps}
                rowKey="id"
                pagination={false}
              />
            </Card>

            <Card title="自动上传配置">
              <Paragraph>
                <Text strong>使用 Webpack 插件：</Text>
              </Paragraph>
              <pre
                style={{
                  background: '#f5f5f5',
                  padding: 16,
                  borderRadius: 4,
                  overflow: 'auto',
                }}
              >
                {`// webpack.config.js
const RewindWebpackPlugin = require('@rewind-dev/webpack-plugin');

module.exports = {
  plugins: [
    new RewindWebpackPlugin({
      apiKey: '${currentProject?.apiKey || 'YOUR_API_KEY'}',
      appVersion: '1.0.0',
    }),
  ],
};`}
              </pre>
            </Card>
          </Space>
        </TabPane>
      </Tabs>
    </div>
  );
};
