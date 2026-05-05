/**
 * 登录页
 * Login Page
 * ログインページ
 * 登入頁
 */

import React, { useEffect } from 'react';
import { Form, Input, Button, Card, message, Tabs } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined } from '@ant-design/icons';
import { useNavigate } from '@tanstack/react-router';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { login, register, clearError } from '../store/auth.slice';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { loading, error, token } = useAppSelector((state) => state.auth);
  const [loginForm] = Form.useForm();
  const [registerForm] = Form.useForm();

  useEffect(() => {
    if (token) {
      navigate({ to: '/projects' });
    }
  }, [token, navigate]);

  useEffect(() => {
    if (error) {
      message.error(error);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  const handleLogin = async (values: { email: string; password: string }) => {
    await dispatch(login(values));
  };

  const handleRegister = async (values: {
    email: string;
    password: string;
    name: string;
  }) => {
    await dispatch(register(values));
  };

  const loginTab = (
    <Form form={loginForm} onFinish={handleLogin} layout="vertical" size="large">
      <Form.Item
        name="email"
        rules={[
          { required: true, message: '请输入邮箱' },
          { type: 'email', message: '请输入有效的邮箱地址' },
        ]}
      >
        <Input prefix={<MailOutlined />} placeholder="邮箱" />
      </Form.Item>

      <Form.Item
        name="password"
        rules={[{ required: true, message: '请输入密码' }]}
      >
        <Input.Password prefix={<LockOutlined />} placeholder="密码" />
      </Form.Item>

      <Form.Item>
        <Button type="primary" htmlType="submit" block loading={loading}>
          登录
        </Button>
      </Form.Item>
    </Form>
  );

  const registerTab = (
    <Form
      form={registerForm}
      onFinish={handleRegister}
      layout="vertical"
      size="large"
    >
      <Form.Item
        name="name"
        rules={[{ required: true, message: '请输入姓名' }]}
      >
        <Input prefix={<UserOutlined />} placeholder="姓名" />
      </Form.Item>

      <Form.Item
        name="email"
        rules={[
          { required: true, message: '请输入邮箱' },
          { type: 'email', message: '请输入有效的邮箱地址' },
        ]}
      >
        <Input prefix={<MailOutlined />} placeholder="邮箱" />
      </Form.Item>

      <Form.Item
        name="password"
        rules={[
          { required: true, message: '请输入密码' },
          { min: 6, message: '密码至少 6 位' },
        ]}
      >
        <Input.Password prefix={<LockOutlined />} placeholder="密码" />
      </Form.Item>

      <Form.Item
        name="confirmPassword"
        dependencies={['password']}
        rules={[
          { required: true, message: '请确认密码' },
          ({ getFieldValue }) => ({
            validator(_, value) {
              if (!value || getFieldValue('password') === value) {
                return Promise.resolve();
              }
              return Promise.reject(new Error('两次输入的密码不一致'));
            },
          }),
        ]}
      >
        <Input.Password prefix={<LockOutlined />} placeholder="确认密码" />
      </Form.Item>

      <Form.Item>
        <Button type="primary" htmlType="submit" block loading={loading}>
          注册
        </Button>
      </Form.Item>
    </Form>
  );

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      }}
    >
      <Card
        style={{
          width: 450,
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <h1 style={{ fontSize: 32, fontWeight: 'bold', margin: 0 }}>
            Rewind
          </h1>
          <p style={{ color: '#999', marginTop: 8 }}>
            前端智能监控与问题定位平台
          </p>
        </div>

        <Tabs
          defaultActiveKey="login"
          centered
          items={[
            {
              key: 'login',
              label: '登录',
              children: loginTab,
            },
            {
              key: 'register',
              label: '注册',
              children: registerTab,
            },
          ]}
        />
      </Card>
    </div>
  );
};
