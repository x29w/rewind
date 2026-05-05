import React from 'react';
import { Card, List } from 'antd';

export const ProjectListPage: React.FC = () => {
  const projects = [
    { id: '1', name: 'My App', apiKey: 'xxx-xxx-xxx' },
    { id: '2', name: 'Another App', apiKey: 'yyy-yyy-yyy' },
  ];

  return (
    <div>
      <h1>Projects</h1>
      <List
        grid={{ gutter: 16, column: 3 }}
        dataSource={projects}
        renderItem={(project) => (
          <List.Item>
            <Card title={project.name}>
              <p>API Key: {project.apiKey}</p>
            </Card>
          </List.Item>
        )}
      />
    </div>
  );
};
