import React from 'react';
import { Query } from 'react-apollo';
import { Table, Avatar, Button, Icon, Popconfirm, Form, Drawer, Input, Select, message, } from 'antd';
import gql from 'graphql-tag';
import { startCase, omit, get } from 'lodash';
import { client } from '../../utils/client';
import { stringToColor } from '../../utils/stringToColor';
import { Auth } from '../../stores/auth';

export const Users = Form.create()(({ form }) => {
  const [confirmDirty, setConfirmDirty] = React.useState(false);
  const [isVisible, setVisible] = React.useState(false);

  let refetchTable: any;

  const showDialog = () => {
    form.resetFields();
    setVisible(true);
  }

  const hideDialog = () => {
    setVisible(false);
  };

  const onCreateClick = () => {
    showDialog();
  };

  const onRemoveClick = async (id: string) => {
    const res = await client.mutate({
      mutation: gql`
        mutation removeUser($id:ID!) {
          removeUser(id:$id)
        }
      `,
      variables: { id },
    });

    if (res.data) {
      refetchTable();
      message.info('User has been removed');
    }
  }

  const compareToFirstPassword = (rule: any, value: any, callback: (input?: string) => void) => {
    if (value && value !== form.getFieldValue('password')) {
      callback('The passwords do not match');
    } else {
      callback();
    }
  }

  const validateToNextPassword = (rule: any, value: any, callback: (input?: string) => void) => {
    if (value && confirmDirty) {
      form.validateFields(['confirm'], { force: true });
    }
    callback();
  }

  const onPasswordBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setConfirmDirty(confirmDirty || !!value);
  }

  const onSubmit = (e: React.FormEvent<HTMLElement>) => {
    e.preventDefault();
    form.validateFieldsAndScroll(async (err, values) => {
      if (!err) {
        const data = form.getFieldsValue();
        const res = await client.mutate({
          mutation: gql`
            mutation createUser($input:CreateUserInput) {
              createUser(input:$input) {
                id
                firstname
                lastname
                email
                roles
                lastLogin
                createdAt
                updatedAt
              }
            }
          `,
          variables: {
            input: {
              ...omit(data, ['confirm', 'role']),
              roles: [get(data, 'role', 'user')],
            }
          },
        });

        if (res.errors) {
          const errorMessage = get(res.errors, '0.extensions.exception.errors.0.message', 'Unknown error');
          message.error(errorMessage);
        } else {
          refetchTable();
          hideDialog();
          message.info('User has been created');
        }
      }
    });
  };

  const isEditing = false;

  const columns = [{
    key: 'name',
    title: 'Name',
    render(text: string, record: any) {
      return (
        <>
          <Avatar style={{ backgroundColor: stringToColor(record.email), marginRight: 16 }}>
            {record.firstname.substring(0, 1)}{record.lastname.substring(0, 1)}
          </Avatar>
          {[record.firstname, record.lastname].join(' ')}
        </>
      );
    }
  }, {
    key: 'email',
    title: 'Email',
    dataIndex: 'email',
  }, {
    key: 'roles',
    title: 'Roles',
    render(text: string, record: any) {
      return record.roles.map((role: string) => startCase(role)).join(', ');
    }
  }, {
    key: 'actions',
    align: 'right' as any,
    render(text: string, record: any) {
      return (
        <span onClick={(e: any) => e.stopPropagation()}>
          <Popconfirm
            title="Are you sure?"
            icon={<Icon type="question-circle-o" style={{ color: 'red' }} />}
            onConfirm={() => onRemoveClick(record.id)}
            trigger={record.id === Auth.user!.id ? 'contextMenu' : undefined}
          >
            <Button
              style={{ paddingLeft: 8, paddingRight: 8 }}
              disabled={record.id === Auth.user!.id}
            >
              <Icon
                type="delete"
                theme="filled"
              />
            </Button>
          </Popconfirm>
        </span>
      );
    }
  }];

  return (
    <>
      <Query
        client={client}
        query={gql`
          query {
            allUsers {
              id
              firstname
              lastname
              email
              roles
              lastLogin
              createdAt
              updatedAt
            }
          }
        `}
      >
        {({ data, loading, error, refetch }) => {
          if (error) return null;
          refetchTable = refetch;
          return (
            <Table
              footer={() => <Button onClick={onCreateClick}>Create</Button>}
              columns={columns}
              dataSource={data && data.allUsers && data.allUsers.sort((a: any, b: any) => a.firstname.localeCompare(b.firstname))}
              rowClassName={() => 'prime-row-click'}
              rowKey="id"
              onRow={(record) => ({
                onClick: () => console.log('edit user')
              })}
            />
          )
        }}
      </Query>
      <Drawer
        title={`${isEditing ? 'Edit' : 'Create'} User`}
        width={360}
        placement="right"
        maskClosable={true}
        onClose={hideDialog}
        visible={isVisible}
        className="prime__drawer"
      >
        <Form onSubmit={onSubmit}>
          <Form.Item label="First name">
            {form.getFieldDecorator('firstname')(
              <Input autoFocus={!isEditing} />
            )}
          </Form.Item>
          <Form.Item label="Last name">
            {form.getFieldDecorator('lastname')(
              <Input />
            )}
          </Form.Item>
          <Form.Item label="Email address">
            {form.getFieldDecorator('email', {
              rules: [{
                type: 'email',
                message: 'Please enter a valid email address',
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
            {form.getFieldDecorator('password', {
              rules: [{
                required: true,
                message: 'Please enter a password',
              }, {
                min: 6,
                message: 'Enter at least 6 characters',
              }, {
                validator: validateToNextPassword,
              }],
            })(
              <Input
                type="password"
                size="large"
                placeholder="Password"
                onBlur={onPasswordBlur}
              />
            )}
          </Form.Item>
          <Form.Item label="Confirm password" required>
            {form.getFieldDecorator('confirm', {
              rules: [{
                required: true,
                message: 'Please confirm the password',
              }, {
                validator: compareToFirstPassword,
              }],
            })(
              <Input
                type="password"
                placeholder="Confirm password"
                size="large"
              />
            )}
          </Form.Item>
          <Form.Item label="Roles">
            {form.getFieldDecorator('role')(
              <Select size="large">
                <Select.Option key="admin">Admin</Select.Option>
                <Select.Option key="developer">Developer</Select.Option>
                <Select.Option key="publisher">Publisher</Select.Option>
                <Select.Option key="editor">Editor</Select.Option>
              </Select>
            )}
          </Form.Item>
          <div className="prime__drawer__bottom">
            <Button style={{ marginRight: 8 }} onClick={hideDialog}>Cancel</Button>
            <Button onClick={onSubmit} type="primary" htmlType="submit">{isEditing ? 'Save' : 'Create'}</Button>
          </div>
        </Form>
      </Drawer>
    </>
  );
});
