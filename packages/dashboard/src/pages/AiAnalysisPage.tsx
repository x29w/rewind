import React, { useState, useEffect } from 'react';
import { Card, Button, Spin, Alert, Divider, Tag, List, Typography } from 'antd';
import { BulbOutlined, ThunderboltOutlined, LinkOutlined } from '@ant-design/icons';
import { useParams } from '@tanstack/react-router';

const { Title, Paragraph, Text } = Typography;

interface AnalysisResult {
  rootCause: string;
  possibleReasons: string[];
  fixSuggestions: string[];
  relatedIssues: string[];
  severity: 'low' | 'medium' | 'high' | 'critical';
}

const severityColors: Record<string, string> = {
  low: 'green',
  medium: 'orange',
  high: 'red',
  critical: 'purple',
};

export const AiAnalysisPage: React.FC = () => {
  const { issueId } = useParams({ strict: false });
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalysis = async () => {
    setLoading(true);
    setError(null);

    try {
      // 模拟 API 调用
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // 模拟数据
      const mockAnalysis: AnalysisResult = {
        rootCause: "The error occurs because the code attempts to access the 'data' property on an undefined object. This typically happens when an API response is not properly validated before accessing its properties.",
        possibleReasons: [
          'API request failed and returned undefined instead of an error object',
          'Response data structure changed but code was not updated',
          'Missing null/undefined check before accessing nested properties',
          'Race condition where component unmounts before async operation completes',
        ],
        fixSuggestions: [
          'Add optional chaining: response?.data instead of response.data',
          'Implement proper error handling with try-catch blocks',
          'Add TypeScript interfaces to enforce response structure',
          'Use a data validation library like Zod or Yup',
          'Add loading states and null checks in the component',
        ],
        relatedIssues: [
          'TypeError: Cannot read property of null',
          'Uncaught TypeError: undefined is not an object',
          'API response validation failures',
        ],
        severity: 'high',
      };

      setAnalysis(mockAnalysis);
    } catch (err) {
      setError('Failed to fetch AI analysis');
    } finally {
      setLoading(false);
    }
  };

  const triggerAnalysis = async () => {
    setLoading(true);
    setError(null);

    try {
      // 模拟 AI 分析
      await new Promise((resolve) => setTimeout(resolve, 3000));
      await fetchAnalysis();
    } catch (err) {
      setError('AI analysis failed');
      setLoading(false);
    }
  };

  useEffect(() => {
    // 尝试加载已有的分析结果
    fetchAnalysis();
  }, [issueId]);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <Title level={2}>AI Analysis</Title>
        <Button
          type="primary"
          icon={<ThunderboltOutlined />}
          onClick={triggerAnalysis}
          loading={loading}
          disabled={loading}
        >
          {analysis ? 'Re-analyze' : 'Analyze with AI'}
        </Button>
      </div>

      {error && (
        <Alert
          message="Error"
          description={error}
          type="error"
          showIcon
          closable
          style={{ marginBottom: 24 }}
        />
      )}

      {loading && !analysis && (
        <Card>
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <Spin size="large" />
            <Paragraph style={{ marginTop: 16, color: '#999' }}>
              AI is analyzing the error... This may take a few seconds.
            </Paragraph>
          </div>
        </Card>
      )}

      {analysis && (
        <>
          <Card style={{ marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
              <BulbOutlined style={{ fontSize: 24, color: '#1890ff', marginRight: 12 }} />
              <Title level={4} style={{ margin: 0 }}>Root Cause Analysis</Title>
              <Tag color={severityColors[analysis.severity]} style={{ marginLeft: 'auto' }}>
                {analysis.severity.toUpperCase()}
              </Tag>
            </div>
            <Paragraph>{analysis.rootCause}</Paragraph>
          </Card>

          <Card title="Possible Reasons" style={{ marginBottom: 16 }}>
            <List
              dataSource={analysis.possibleReasons}
              renderItem={(item, index) => (
                <List.Item>
                  <Text>
                    <strong>{index + 1}.</strong> {item}
                  </Text>
                </List.Item>
              )}
            />
          </Card>

          <Card title="Fix Suggestions" style={{ marginBottom: 16 }}>
            <List
              dataSource={analysis.fixSuggestions}
              renderItem={(item, index) => (
                <List.Item>
                  <div>
                    <Tag color="green">Suggestion {index + 1}</Tag>
                    <Text>{item}</Text>
                  </div>
                </List.Item>
              )}
            />
          </Card>

          {analysis.relatedIssues.length > 0 && (
            <Card title={<><LinkOutlined /> Related Issues</>}>
              <List
                dataSource={analysis.relatedIssues}
                renderItem={(item) => (
                  <List.Item>
                    <Button type="link">{item}</Button>
                  </List.Item>
                )}
              />
            </Card>
          )}

          <Alert
            message="AI-Powered Analysis"
            description="This analysis is generated by AI and should be used as a reference. Always verify suggestions in your specific context."
            type="info"
            showIcon
            style={{ marginTop: 16 }}
          />
        </>
      )}
    </div>
  );
};
