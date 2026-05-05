/**
 * 首页路由
 * Home Route
 * ホームルート
 * 首頁路由
 */

import { createFileRoute, Link } from '@tanstack/react-router';
import { Typography, Card, Row, Col, Statistic, Button, Space } from 'antd';
import {
  BugOutlined,
  ThunderboltOutlined,
  BarChartOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
} from '@ant-design/icons';

const { Title, Paragraph } = Typography;

/**
 * 首页组件
 * Home Component
 * ホームコンポーネント
 * 首頁元件
 */
const HomePage = () => {
  return (
    <div>
      <Title level={2}>欢迎使用 Rewind 前端监控平台</Title>
      <Paragraph style={{ fontSize: '16px', color: '#666' }}>
        让每个错误都有迹可循 - 通过行为录制和 AI 分析帮助开发者快速定位线上问题
      </Paragraph>

      <Row gutter={[16, 16]} style={{ marginTop: '32px' }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="错误总数"
              value={1234}
              prefix={<BugOutlined />}
              suffix={
                <span style={{ fontSize: '14px', color: '#cf1322' }}>
                  <ArrowUpOutlined /> 12%
                </span>
              }
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="新增 Issue"
              value={45}
              prefix={<BugOutlined />}
              valueStyle={{ color: '#3f8600' }}
              suffix={
                <span style={{ fontSize: '14px', color: '#3f8600' }}>
                  <ArrowDownOutlined /> 8%
                </span>
              }
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="白屏次数"
              value={23}
              prefix={<BarChartOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="API 错误率"
              value={2.5}
              prefix={<ThunderboltOutlined />}
              suffix="%"
            />
          </Card>
        </Col>
      </Row>

      <Card
        title="快速开始"
        style={{ marginTop: '32px' }}
        extra={
          <Link to="/projects">
            <Button type="link">查看所有项目</Button>
          </Link>
        }
      >
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <div>
            <Title level={4}>1. 查看问题列表</Title>
            <Paragraph>
              查看所有已归并的 Issue，快速了解当前线上问题情况
            </Paragraph>
            <Link to="/issues">
              <Button type="primary" icon={<BugOutlined />}>
                前往问题管理
              </Button>
            </Link>
          </div>

          <div>
            <Title level={4}>2. 监控 API 性能</Title>
            <Paragraph>
              实时监控接口请求，快速发现接口异常和性能问题
            </Paragraph>
            <Link to="/api-monitoring">
              <Button icon={<ThunderboltOutlined />}>
                前往 API 监控
              </Button>
            </Link>
          </div>

          <div>
            <Title level={4}>3. 白屏检测</Title>
            <Paragraph>
              自动检测页面白屏问题，关联用户操作轨迹
            </Paragraph>
            <Link to="/blank-screen">
              <Button icon={<BarChartOutlined />}>
                前往白屏检测
              </Button>
            </Link>
          </div>
        </Space>
      </Card>

      <Card title="系统状态" style={{ marginTop: '24px' }}>
        <Row gutter={16}>
          <Col span={8}>
            <Statistic title="SDK 版本" value="1.0.0" />
          </Col>
          <Col span={8}>
            <Statistic title="数据采集" value="正常" valueStyle={{ color: '#3f8600' }} />
          </Col>
          <Col span={8}>
            <Statistic title="告警状态" value="正常" valueStyle={{ color: '#3f8600' }} />
          </Col>
        </Row>
      </Card>
    </div>
  );
};

export const Route = createFileRoute('/')({
  component: HomePage,
});
