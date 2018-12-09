import React from 'react';
import { Form, Input, Button } from 'antd';
import { Redirect } from 'react-router';

export class Onboarding extends React.Component {

  onSubmit() {

  }

  render() {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Redirect to="/login" />
        <Form
          onSubmit={this.onSubmit}
          style={{ width: 300 }}
          action="/login"
          layout="vertical"
        >
          <div style={{ color: 'black', fontSize: 24, marginBottom: 16, fontFamily: 'system' }}>prime</div>
          <Form.Item label="Full name">
            <Input
              placeholder="Name"
              size="large"
            />
          </Form.Item>
          <Form.Item label="Email address" required>
            <Input
              placeholder="Email address"
              size="large"
            />
          </Form.Item>
          <Form.Item label="Password" required>
            <Input
              type="password"
              placeholder="Password"
              size="large"
            />
          </Form.Item>
          <Form.Item label="Confirm password" required>
            <Input
              type="password"
              placeholder="Confirm password"
              size="large"
            />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" size="large">
              Continue
            </Button>
          </Form.Item>
        </Form>
      </div>
    );
  }
}
