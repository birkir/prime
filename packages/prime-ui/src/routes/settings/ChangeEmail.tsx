import { Form, Input, message } from 'antd';
import { FormComponentProps } from 'antd/lib/form';
import gql from 'graphql-tag';
import React from 'react';
import { Auth } from '../../stores/auth';
import { accountsClient, accountsGraphQL } from '../../utils/accounts';
import { client } from '../../utils/client';

type IProps = FormComponentProps & {
  forwardRef: any;
  visible: boolean;
  close(): void;
};

export const ChangeEmail = Form.create()(({ form, forwardRef, close, visible }: IProps) => {
  React.useEffect(() => form.resetFields(), [visible]);

  const onSubmit = (e: React.FormEvent<HTMLElement>) => {
    e.preventDefault();
    form.validateFieldsAndScroll(async (err, values) => {
      if (!err) {
        const res = await client.mutate({
          mutation: gql`
            mutation changeEmail($password: String!, $email: String!) {
              changeEmail(password: $password, email: $email)
            }
          `,
          variables: {
            password: values.oldpassword,
            email: values.email,
          },
        });
        if (res.errors) {
          if (res.errors.length && res.errors[0].message.match(/duplicate key/)) {
            message.error('This email address is already in use');
          } else {
            const errorMessage = res.errors[0].message || 'Failed to change email';
            message.error(errorMessage);
          }
        } else {
          message.info('Verification email has been sent');
          Auth.user!.updateEmail(values.email);
          close();
        }
      }
    });
  };

  return (
    <Form onSubmit={onSubmit} ref={forwardRef}>
      <Form.Item label="Password" required>
        {form.getFieldDecorator('oldpassword', {
          rules: [
            {
              required: true,
              message: 'Please enter old password',
            },
          ],
        })(<Input type="password" size="large" placeholder="Password" />)}
      </Form.Item>
      <Form.Item label="New Email Address" required>
        {form.getFieldDecorator('email', {
          rules: [
            {
              required: true,
              message: 'Please enter email address',
            },
            {
              type: 'email',
              message: 'Please enter valid email address',
            },
          ],
        })(<Input placeholder="New email address" autoComplete="off" type="email" size="large" />)}
      </Form.Item>
      <input type="submit" hidden />
    </Form>
  );
});
