/**
 * 堆栈跟踪组件
 * Stack Trace Component
 * スタックトレースコンポーネント
 * 堆疊追蹤元件
 */

import React, { useState } from 'react';
import { Card, Typography, Tag, Space, Button, Collapse } from 'antd';
import {
  FileTextOutlined,
  CodeOutlined,
  EnvironmentOutlined,
} from '@ant-design/icons';

const { Text, Paragraph } = Typography;
const { Panel } = Collapse;

interface StackFrame {
  fileName: string;
  lineNumber: number;
  columnNumber: number;
  functionName?: string;
  source?: string;
  context?: {
    pre: string[];
    line: string;
    post: string[];
  };
}

interface StackTraceProps {
  stack: string;
  resolvedStack?: StackFrame[];
}

export const StackTrace: React.FC<StackTraceProps> = ({
  stack,
  resolvedStack,
}) => {
  const [showRaw, setShowRaw] = useState(false);

  const parseStack = (stackString: string): StackFrame[] => {
    const lines = stackString.split('\n');
    const frames: StackFrame[] = [];

    for (const line of lines) {
      // 匹配格式：at functionName (file.js:line:column)
      const match = line.match(/at\s+(.+?)\s+\((.+?):(\d+):(\d+)\)/);
      if (match) {
        frames.push({
          functionName: match[1],
          fileName: match[2],
          lineNumber: parseInt(match[3], 10),
          columnNumber: parseInt(match[4], 10),
        });
        continue;
      }

      // 匹配格式：at file.js:line:column
      const match2 = line.match(/at\s+(.+?):(\d+):(\d+)/);
      if (match2) {
        frames.push({
          fileName: match2[1],
          lineNumber: parseInt(match2[2], 10),
          columnNumber: parseInt(match2[3], 10),
        });
      }
    }

    return frames;
  };

  const frames = resolvedStack || parseStack(stack);

  const renderFrame = (frame: StackFrame, index: number) => {
    const isAppCode = !frame.fileName.includes('node_modules');

    return (
      <Panel
        key={index}
        header={
          <Space>
            {isAppCode && <Tag color="blue">APP</Tag>}
            <Text strong={isAppCode}>
              {frame.functionName || '<anonymous>'}
            </Text>
            <Text type="secondary" style={{ fontSize: 12 }}>
              {frame.fileName}:{frame.lineNumber}:{frame.columnNumber}
            </Text>
          </Space>
        }
      >
        <div style={{ background: '#f5f5f5', padding: 12, borderRadius: 4 }}>
          <Space direction="vertical" style={{ width: '100%' }}>
            <Space>
              <FileTextOutlined />
              <Text code>{frame.fileName}</Text>
            </Space>
            <Space>
              <EnvironmentOutlined />
              <Text>
                行 {frame.lineNumber}, 列 {frame.columnNumber}
              </Text>
            </Space>
            {frame.functionName && (
              <Space>
                <CodeOutlined />
                <Text code>{frame.functionName}</Text>
              </Space>
            )}
          </Space>

          {frame.context && (
            <div style={{ marginTop: 12 }}>
              <pre
                style={{
                  background: '#fff',
                  padding: 12,
                  borderRadius: 4,
                  fontSize: 12,
                  lineHeight: 1.6,
                  overflow: 'auto',
                }}
              >
                {frame.context.pre.map((line, i) => (
                  <div key={`pre-${i}`} style={{ color: '#999' }}>
                    {frame.lineNumber - frame.context!.pre.length + i}{' '}
                    {line}
                  </div>
                ))}
                <div
                  style={{
                    background: '#fff3cd',
                    color: '#856404',
                    fontWeight: 'bold',
                  }}
                >
                  {frame.lineNumber} {frame.context.line}
                </div>
                {frame.context.post.map((line, i) => (
                  <div key={`post-${i}`} style={{ color: '#999' }}>
                    {frame.lineNumber + i + 1} {line}
                  </div>
                ))}
              </pre>
            </div>
          )}
        </div>
      </Panel>
    );
  };

  return (
    <Card
      title="堆栈跟踪"
      extra={
        <Button size="small" onClick={() => setShowRaw(!showRaw)}>
          {showRaw ? '查看解析' : '查看原始'}
        </Button>
      }
    >
      {showRaw ? (
        <pre
          style={{
            background: '#f5f5f5',
            padding: 12,
            borderRadius: 4,
            fontSize: 12,
            lineHeight: 1.6,
            overflow: 'auto',
            maxHeight: 400,
          }}
        >
          {stack}
        </pre>
      ) : (
        <Collapse accordion>{frames.map(renderFrame)}</Collapse>
      )}
    </Card>
  );
};
