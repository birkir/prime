import { Button, Form, Icon, Input, message } from 'antd';
import { FormComponentProps } from 'antd/lib/form';
import React from 'react';
import { Link, Redirect } from 'react-router-dom';
import { Auth } from '../../stores/auth';
import { ContentTypes } from '../../stores/contentTypes';

class LoginBase extends React.Component<FormComponentProps> {
  public onSubmit = async (e: React.FormEvent<HTMLElement>) => {
    e.preventDefault();
    const values: any = this.props.form.getFieldsValue();
    try {
      await Auth.login(values.email, values.password);

      (this.props as any).history.push('/');
    } catch (err) {
      message.error('Invalid email or password');
    }
    return false;
  };

  public render() {
    if (Auth.isSetup) {
      return <Redirect to="/setup" />;
    }

    const { getFieldDecorator } = this.props.form;
    return (
      <div
        style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      >
        <Form
          onSubmit={this.onSubmit}
          style={{ width: 300 }}
          action="/login"
          autoComplete="prime-login"
        >
          <div style={{ color: 'black', fontSize: 24, marginBottom: 16, fontFamily: 'system' }}>
            prime
          </div>
          <Form.Item>
            {getFieldDecorator('email')(
              <Input
                prefix={<Icon type="user" style={{ color: 'rgba(0,0,0,.25)' }} />}
                placeholder="Email"
                autoComplete="prime-email"
              />
            )}
          </Form.Item>
          <Form.Item>
            {getFieldDecorator('password')(
              <Input
                prefix={<Icon type="lock" style={{ color: 'rgba(0,0,0,.25)' }} />}
                type="password"
                placeholder="Password"
                autoComplete="prime-password"
              />
            )}
          </Form.Item>
          <Form.Item>
            <Button type={'primary' as any} htmlType="submit" className="login-form-button">
              Log in
            </Button>
          </Form.Item>
          <div>
            <Link to="/reset-password">Reset password</Link>
          </div>
        </Form>
      </div>
    );
  }
}

export const Login = Form.create()(LoginBase);
