import { Form, Input, message } from 'antd';
import { FormComponentProps } from 'antd/lib/form';
import gql from 'graphql-tag';
import React from 'react';
import { Auth } from '../../stores/auth';
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
            mutation updateEmail($oldpassword: String!, $email: String!) {
              updateEmail(oldpassword: $oldpassword, email: $email)
            }
          `,
          variables: {
            oldpassword: values.oldpassword,
            email: values.email,
          },
        });
        if (res.errors) {
          const errorMessage = res.errors[0].message || 'Failed to change email';
          message.error(errorMessage);
        } else {
          message.info('Email has been changed');
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
        })(<Input type="password" size="large" placeholder="Old Password" />)}
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
        })(<Input autoComplete="off" type="email" size="large" />)}
      </Form.Item>
      <input type="submit" hidden />
    </Form>
  );
});
