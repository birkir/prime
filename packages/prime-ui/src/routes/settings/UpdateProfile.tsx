import { Avatar, Button, Form, Input, message } from 'antd';
import { FormComponentProps } from 'antd/lib/form';
import gql from 'graphql-tag';
import React from 'react';
import { Auth } from '../../stores/auth';
import { client } from '../../utils/client';

type IUpdateProfileProps = FormComponentProps & { user: any };

export const UpdateProfile = Form.create<IUpdateProfileProps>()(
  ({ form, user }: IUpdateProfileProps) => {
    const onSubmit = (e: React.FormEvent<HTMLElement>) => {
      e.preventDefault();
      form.validateFieldsAndScroll(async (err, values) => {
        if (!err) {
          const { data } = await client.mutate({
            mutation: gql`
              mutation updateUser($id: ID!, $input: UpdateUserInput!) {
                updateUser(id: $id, input: $input) {
                  id
                  meta {
                    profile
                  }
                }
              }
            `,
            variables: {
              id: Auth.user!.id,
              input: {
                profile: {
                  firstname: values.firstname,
                  lastname: values.lastname,
                  displayName: values.displayName,
                },
              },
            },
          });
          if (data) {
            user.updateMeta(values);
            message.info('Profile updated');
          }
        }
      });
      return null;
    };

    const displayPlaceHolder = `${String(user.firstname || '').split(' ')[0]} ${String(
      user.lastname || ''
    ).substr(0, 1)}.`;

    return (
      <Form onSubmit={onSubmit}>
        <div style={{ display: 'flex' }}>
          <div style={{ maxWidth: 448, minWidth: 224 }}>
            <Form.Item label="First name" colon={false} style={{ marginBottom: 0 }}>
              {form.getFieldDecorator('firstname', {
                initialValue: user.meta.profile.firstname,
              })(<Input />)}
            </Form.Item>
            <Form.Item label="Last name" colon={false} style={{ marginBottom: 0 }}>
              {form.getFieldDecorator('lastname', {
                initialValue: user.meta.profile.lastname,
              })(<Input />)}
            </Form.Item>
            <Form.Item label="Display name" colon={false} style={{ marginBottom: 12 }}>
              {form.getFieldDecorator('displayName', {
                initialValue: user.meta.profile.displayName,
              })(<Input />)}
            </Form.Item>
            <Button htmlType="submit">Update profile</Button>
          </div>
          <div style={{ flex: 1, paddingLeft: 104 }}>
            <Form.Item label="Avatar" colon={false}>
              <Avatar size={128} src={user.avatarUrl || user.gravatarUrl} />
            </Form.Item>
          </div>
        </div>
      </Form>
    );
  }
);
