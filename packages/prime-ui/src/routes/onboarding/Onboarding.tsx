import React from 'react';
import { Form, Input, Button, message } from 'antd';
import { FormComponentProps } from 'antd/lib/form';
import { Auth } from '../../stores/auth';

export class OnboardingBase extends React.Component<FormComponentProps> {

  state = {
    confirmDirty: false,
  }

  public onSubmit = (e: React.FormEvent<HTMLElement>) => {
    e.preventDefault();

    this.props.form.validateFieldsAndScroll(async (err, values) => {
      if (!err) {
        const values: any = this.props.form.getFieldsValue();
        try {
          await Auth.register({
            firstname: values.firstname,
            lastname: values.lastname,
            email: values.email,
            password: values.password,
          });
          if (Auth.isLoggedIn) {
            (this.props as any).history.push('/');
            return;
          }
        } catch (err) {
          console.error('Setup error', err);
        }
        message.error('Could not setup Prime. Check the logs.');
      }
    });

    return false;
  }

  compareToFirstPassword = (rule: any, value: any, callback: (input?: string) => void) => {
    const form = this.props.form;
    if (value && value !== form.getFieldValue('password')) {
      callback('The passwords do not match');
    } else {
      callback();
    }
  }

  validateToNextPassword = (rule: any, value: any, callback: (input?: string) => void) => {
    const form = this.props.form;
    if (value && this.state.confirmDirty) {
      form.validateFields(['confirm'], { force: true });
    }
    callback();
  }

  onPasswordBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const value = e.target.value;
    this.setState({ confirmDirty: this.state.confirmDirty || !!value });
  }

  render() {
    const { getFieldDecorator } = this.props.form;
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Form
          onSubmit={this.onSubmit}
          style={{ width: 300 }}
          action="/login"
          layout="vertical"
        >
          <div style={{ color: 'black', fontSize: 24, marginBottom: 16, fontFamily: 'system' }}>prime</div>
          <Form.Item label="First name">
            {getFieldDecorator('firstname')(
              <Input
                placeholder="Name"
                size="large"
              />
            )}
          </Form.Item>
          <Form.Item label="Last name">
            {getFieldDecorator('lastname')(
              <Input
                placeholder="Name"
                size="large"
              />
            )}
          </Form.Item>
          <Form.Item label="Email address">
            {getFieldDecorator('email', {
              rules: [{
                type: 'email', message: 'Please enter a valid email address',
              }, {
                required: true,
                message: 'Please enter an email address',
              }]
            })(
              <Input
                placeholder="Email address"
                size="large"
              />
            )}
          </Form.Item>
          <Form.Item label="Password" required>
            {getFieldDecorator('password', {
              rules: [{
                required: true,
                message: 'Please enter a password',
              }, {
                min: 6,
                message: 'Enter at least 6 characters',
              }, {
                validator: this.validateToNextPassword,
              }],
            })(
              <Input
                type="password"
                size="large"
                placeholder="Password"
                onBlur={this.onPasswordBlur}
              />
            )}
          </Form.Item>
          <Form.Item label="Confirm password" required>
            {getFieldDecorator('confirm', {
              rules: [{
                required: true,
                message: 'Please confirm the password',
              }, {
                validator: this.compareToFirstPassword,
              }],
            })(
              <Input
                type="password"
                placeholder="Confirm password"
                size="large"
              />
            )}
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

export const Onboarding = Form.create()(OnboardingBase);
