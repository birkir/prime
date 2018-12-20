import React from 'react';
import { Form, Input, Avatar, Button, message } from 'antd';
import { client } from '../../utils/client';
import gql from 'graphql-tag';
import { FormComponentProps } from 'antd/lib/form';

type IUpdateProfileProps = FormComponentProps & { user: any };

export const UpdateProfile = Form.create()(({ form, user }: IUpdateProfileProps) => {

  const onSubmit = (e: React.FormEvent<HTMLElement>) => {
    e.preventDefault();
    form.validateFieldsAndScroll(async (err, values) => {
      console.log(values);
      if (!err) {
        client.mutate({
          mutation: gql`
            mutation updateProfile(
              $firstname: String
              $lastname: String
              $displayName: String
            ) {
              updateProfile(
                firstname: $firstname
                lastname: $lastname
                displayName: $displayName
              )
            }
          `,
          variables: {
            firstname: values.firstname,
            lastname: values.lastname,
            displayName: values.displayName,
          }
        });
        user.updateProfile(values);
        message.info('Profile updated');
      }
    });
    return null;
  }

  const displayPlaceHolder = `${String(user.firstname || '').split(' ')[0]} ${String(user.lastname || '').substr(0, 1)}.`;

  return (
    <Form onSubmit={onSubmit}>
      <div style={{ display: 'flex' }}>
        <div style={{ maxWidth: 448, minWidth: 224 }}>
          <Form.Item label="First name" colon={false} style={{ marginBottom: 0 }}>
            {form.getFieldDecorator('firstname', {
              initialValue: user.firstname
            })(
              <Input />
            )}
          </Form.Item>
          <Form.Item label="Last name" colon={false} style={{ marginBottom: 0 }}>
            {form.getFieldDecorator('lastname', {
              initialValue: user.lastname
            })(
              <Input />
            )}
          </Form.Item>
          <Form.Item label="Display name" colon={false} style={{ marginBottom: 12 }}>
            {form.getFieldDecorator('displayName', {
              initialValue: user.displayName
            })(
              <Input />
            )}
          </Form.Item>
          <Button htmlType="submit">Update profile</Button>
        </div>
        <div style={{ flex: 1, paddingLeft: 104 }}>
          <Form.Item label="Avatar" colon={false}>
            <Avatar
              size={128}
              src={user.avatarUrl || user.gravatarUrl}
            />
          </Form.Item>
        </div>
      </div>
      </Form>
    );
});
