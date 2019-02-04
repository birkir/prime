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

export const ChangePassword = Form.create()(({ form, forwardRef, close, visible }: IProps) => {
  const [confirmDirty, setConfirmDirty] = React.useState(false);

  // reset form on visible change
  React.useEffect(() => form.resetFields(), [visible]);

  const onSubmit = (e: React.FormEvent<HTMLElement>) => {
    e.preventDefault();
    form.validateFieldsAndScroll(async (err, values) => {
      if (!err) {
        const res = await client.mutate({
          mutation: gql`
            mutation updatePassword($oldpassword: String!, $newpassword: String!) {
              updatePassword(oldpassword: $oldpassword, newpassword: $newpassword)
            }
          `,
          variables: {
            oldpassword: values.oldpassword,
            newpassword: values.newpassword,
          },
        });
        if (res.errors) {
          const errorMessage = res.errors[0].message || 'Failed to change password';
          message.error(errorMessage);
        } else {
          message.info('Password has been changed');
          // Auth.user!.updateLastPasswordChange();
          close();
        }
      }
    });
  };

  const compareToFirstPassword = (rule: any, value: any, callback: (input?: string) => void) =>
    callback(
      value && value !== form.getFieldValue('newpassword')
        ? 'The passwords do not match'
        : undefined
    );

  const validateToNextPassword = (rule: any, value: any, callback: (input?: string) => void) => {
    if (value && confirmDirty) {
      form.validateFields(['confirm'], { force: true });
    }
    callback();
  };

  const onPasswordBlur = (e: React.FocusEvent<HTMLInputElement>) =>
    setConfirmDirty(confirmDirty || !!e.target.value);

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
      <Form.Item label="New Password" required>
        {form.getFieldDecorator('newpassword', {
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
              validator: validateToNextPassword,
            },
          ],
        })(
          <Input
            autoComplete="off"
            type="password"
            size="large"
            placeholder="Password"
            onBlur={onPasswordBlur}
          />
        )}
      </Form.Item>
      <Form.Item label="Confirm password" required>
        {form.getFieldDecorator('confirm', {
          rules: [
            {
              required: true,
              message: 'Please confirm the password',
            },
            {
              validator: compareToFirstPassword,
            },
          ],
        })(
          <Input autoComplete="off" type="password" placeholder="Confirm password" size="large" />
        )}
      </Form.Item>
      <input type="submit" hidden />
    </Form>
  );
});
