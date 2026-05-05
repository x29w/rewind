/**
 * AI 分析页
 * AI Analysis Page
 * AI分析ページ
 * AI 分析頁
 */

import React, { useState, useEffect } from 'react';
import {
  Card,
  Button,
  Spin,
  Alert,
  Tag,
  List,
  Typography,
  Space,
  Progress,
  Empty,
  Divider,
} from 'antd';
import {
  BulbOutlined,
  ThunderboltOutlined,
  LinkOutlined,
  CheckCircleOutlined,
  WarningOutlined,
  RobotOutlined,
} from '@ant-design/icons';
import { useParams, useNavigate } from '@tanstack/react-router';
import { analyzeIssueService, getAnalysisService, findSimilarService } from '../api/ai';

const { Title, Paragraph, Text } = Typography;

interface AnalysisResult {
  rootCause: string;
  possibleReasons: string[];
  fixSuggestions: string[];
  relatedIssues: string[];
  severity: 'low' | 'medium' | 'high' | 'critical';
  confidence: number;
}

const severityColors: Record<string, string> = {
  low: 'green',
  medium: 'orange',
  high: 'red',
  critical: 'purple',
};

const severityLabels: Record<string, string> = {
  low: '低',
  medium: '中',
  high: '高',
  critical: '严重',
};

export const AiAnalysisPage: React.FC = () => {
  const { issueId } = useParams({ strict: false });
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [similarIssues, setSimilarIssues] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalysis = async () => {
    if (!issueId) return;

    setLoading(true);
    setError(null);

    try {
      const result = await getAnalysisService({ issueId });
      setAnalysis(result);
    } catch (err: any) {
      // 如果没有分析结果，不显示错误
      if (err?.response?.status !== 404) {
        setError('获取分析结果失败');
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchSimilarIssues = async () => {
    if (!issueId) return;

    try {
      const issues = await findSimilarService({ issueId });
      setSimilarIssues(issues);
    } catch (err) {
      console.error('获取相似问题失败', err);
    }
  };

  const triggerAnalysis = async () => {
    if (!issueId) return;

    setLoading(true);
    setError(null);

    try {
      const result = await analyzeIssueService({ issueId });
      setAnalysis(result);
      await fetchSimilarIssues();
    } catch (err) {
      setError('AI 分析失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalysis();
    fetchSimilarIssues();
  }, [issueId]);

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return '#52c41a';
    if (confidence >= 60) return '#faad14';
    return '#ff4d4f';
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
          <Title level={2} style={{ margin: 0 }}>
            <RobotOutlined style={{ marginRight: 8 }} />
            AI 智能分析
          </Title>
          <Text type="secondary">
            使用 AI 技术分析问题根因并提供修复建议
          </Text>
        </div>
        <Button
          type="primary"
          icon={<ThunderboltOutlined />}
          onClick={triggerAnalysis}
          loading={loading}
          disabled={loading}
          size="large"
        >
          {analysis ? '重新分析' : '开始 AI 分析'}
        </Button>
      </div>

      {/* 错误提示 */}
      {error && (
        <Alert
          message="分析失败"
          description={error}
          type="error"
          showIcon
          closable
          onClose={() => setError(null)}
          style={{ marginBottom: 24 }}
        />
      )}

      {/* 加载状态 */}
      {loading && !analysis && (
        <Card>
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <Spin size="large" />
            <Paragraph style={{ marginTop: 16, color: '#999' }}>
              AI 正在分析错误... 这可能需要几秒钟
            </Paragraph>
          </div>
        </Card>
      )}

      {/* 空状态 */}
      {!loading && !analysis && !error && (
        <Card>
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="暂无 AI 分析结果"
          >
            <Button
              type="primary"
              icon={<ThunderboltOutlined />}
              onClick={triggerAnalysis}
            >
              开始 AI 分析
            </Button>
          </Empty>
        </Card>
      )}

      {/* 分析结果 */}
      {analysis && (
        <>
          {/* 置信度和严重程度 */}
          <Card style={{ marginBottom: 16 }}>
            <Space size="large" style={{ width: '100%', justifyContent: 'space-around' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ marginBottom: 8 }}>
                  <Text type="secondary">分析置信度</Text>
                </div>
                <Progress
                  type="circle"
                  percent={analysis.confidence}
                  strokeColor={getConfidenceColor(analysis.confidence)}
                  width={100}
                />
              </div>
              <Divider type="vertical" style={{ height: 100 }} />
              <div style={{ textAlign: 'center' }}>
                <div style={{ marginBottom: 8 }}>
                  <Text type="secondary">严重程度</Text>
                </div>
                <Tag
                  color={severityColors[analysis.severity]}
                  style={{ fontSize: 16, padding: '8px 16px' }}
                >
                  {severityLabels[analysis.severity]}
                </Tag>
              </div>
            </Space>
          </Card>

          {/* 根因分析 */}
          <Card style={{ marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
              <BulbOutlined
                style={{ fontSize: 24, color: '#1890ff', marginRight: 12 }}
              />
              <Title level={4} style={{ margin: 0 }}>
                根因分析
              </Title>
            </div>
            <Paragraph style={{ fontSize: 15, lineHeight: 1.8 }}>
              {analysis.rootCause}
            </Paragraph>
          </Card>

          {/* 可能原因 */}
          <Card title="可能原因" style={{ marginBottom: 16 }}>
            <List
              dataSource={analysis.possibleReasons}
              renderItem={(item, index) => (
                <List.Item>
                  <Space align="start">
                    <WarningOutlined style={{ color: '#faad14', marginTop: 4 }} />
                    <div>
                      <Text strong>原因 {index + 1}</Text>
                      <br />
                      <Text>{item}</Text>
                    </div>
                  </Space>
                </List.Item>
              )}
            />
          </Card>

          {/* 修复建议 */}
          <Card title="修复建议" style={{ marginBottom: 16 }}>
            <List
              dataSource={analysis.fixSuggestions}
              renderItem={(item, index) => (
                <List.Item>
                  <Space align="start">
                    <CheckCircleOutlined
                      style={{ color: '#52c41a', marginTop: 4 }}
                    />
                    <div>
                      <Tag color="green">建议 {index + 1}</Tag>
                      <br />
                      <Text>{item}</Text>
                    </div>
                  </Space>
                </List.Item>
              )}
            />
          </Card>

          {/* 相似问题 */}
          {similarIssues.length > 0 && (
            <Card
              title={
                <Space>
                  <LinkOutlined />
                  <span>相似问题</span>
                </Space>
              }
            >
              <List
                dataSource={similarIssues}
                renderItem={(issue) => (
                  <List.Item
                    actions={[
                      <Button
                        type="link"
                        onClick={() => navigate({ to: `/issues/${issue.id}` })}
                      >
                        查看详情
                      </Button>,
                    ]}
                  >
                    <List.Item.Meta
                      title={issue.title}
                      description={
                        <Space>
                          <Tag color={severityColors[issue.level]}>
                            {issue.level}
                          </Tag>
                          <Text type="secondary">
                            事件数: {issue.eventCount}
                          </Text>
                        </Space>
                      }
                    />
                  </List.Item>
                )}
              />
            </Card>
          )}

          {/* 免责声明 */}
          <Alert
            message="AI 分析说明"
            description="此分析由 AI 生成，仅供参考。请在您的具体环境中验证所有建议。"
            type="info"
            showIcon
            style={{ marginTop: 16 }}
          />
        </>
      )}
    </div>
  );
};
