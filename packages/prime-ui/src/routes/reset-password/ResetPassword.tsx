import { Button, Form, Icon, Input, message } from 'antd';
import { FormComponentProps } from 'antd/lib/form';
import React from 'react';
import { Link } from 'react-router-dom';
import { Auth } from '../../stores/auth';
import { accountsClient, accountsGraphQL } from '../../utils/accounts';

class ResetPasswordBase extends React.Component<FormComponentProps & { match: any }> {
  public state = {
    sent: false,
    confirmDirty: false,
  };

  public onSubmit = async (e: React.FormEvent<HTMLElement>) => {
    e.preventDefault();
    this.props.form.validateFieldsAndScroll(async (err, values) => {
      const { token } = this.props.match.params;
      if (token) {
        const res = await accountsGraphQL.resetPassword(token, values.password);
        if (res) {
          accountsClient.setTokens(res!.tokens);
          await Auth.checkLogin();
        }
        (window as any).location = '/';
      } else {
        await accountsGraphQL.sendResetPasswordEmail(values.email);
        this.setState({ sent: true });
      }
      return false;
    });
  };

  public compareToFirstPassword = (rule: any, value: any, callback: (input?: string) => void) => {
    const form = this.props.form;
    if (value && value !== form.getFieldValue('password')) {
      callback('The passwords do not match');
    } else {
      callback();
    }
  };

  public validateToNextPassword = (rule: any, value: any, callback: (input?: string) => void) => {
    const form = this.props.form;
    if (value && this.state.confirmDirty) {
      form.validateFields(['confirm'], { force: true });
    }
    callback();
  };

  public onPasswordBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const value = e.target.value;
    this.setState({ confirmDirty: this.state.confirmDirty || !!value });
  };

  public render() {
    const { getFieldDecorator } = this.props.form;
    const { token } = this.props.match.params;
    return (
      <div
        style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      >
        <Form onSubmit={this.onSubmit} style={{ width: 300 }} action="/reset-password">
          <div style={{ color: 'black', fontSize: 24, marginBottom: 16, fontFamily: 'system' }}>
            prime
          </div>
          <h3>Reset password</h3>
          {token ? (
            <>
              <Form.Item label="New Password" required>
                {getFieldDecorator('password', {
                  rules: [
                    {
                      required: true,
                      message: 'Please enter a password',
                    },
                    {
                      min: 6,
                      message: 'Enter at least 6 characters',
                    },
                    {
                      validator: this.validateToNextPassword,
                    },
                  ],
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
                  rules: [
                    {
                      required: true,
                      message: 'Please confirm the password',
                    },
                    {
                      validator: this.compareToFirstPassword,
                    },
                  ],
                })(<Input type="password" placeholder="Confirm password" size="large" />)}
              </Form.Item>
              <Form.Item>
                <Button type="primary" htmlType="submit" className="login-form-button">
                  Set Password
                </Button>
              </Form.Item>
            </>
          ) : this.state.sent ? (
            <div style={{ marginBottom: 16 }}>
              We sent an reset password link to the provided email address if it exists in our
              system.
            </div>
          ) : (
            <>
              <Form.Item colon={false}>
                {getFieldDecorator('email')(
                  <Input
                    prefix={<Icon type="user" style={{ color: 'rgba(0,0,0,.25)' }} />}
                    placeholder="Email"
                    autoComplete="prime-email"
                  />
                )}
              </Form.Item>
              <Form.Item>
                <Button type="primary" htmlType="submit" className="login-form-button">
                  Reset Password
                </Button>
              </Form.Item>
            </>
          )}
          <Link to="/login">Go back</Link>
        </Form>
      </div>
    );
  }
}

export const ResetPassword = Form.create()(ResetPasswordBase);
