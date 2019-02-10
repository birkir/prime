import {
  Avatar,
  Button,
  Drawer,
  Form,
  Icon,
  Input,
  message,
  Popconfirm,
  Switch,
  Table,
} from 'antd';
import gql from 'graphql-tag';
import { get } from 'lodash';
import React from 'react';
import { Query } from 'react-apollo';
import { Auth } from '../../stores/auth';
import { client } from '../../utils/client';
import { stringToColor } from '../../utils/stringToColor';

export const Users = Form.create()(({ form }) => {
  const [confirmDirty, setConfirmDirty] = React.useState(false);
  const [isVisible, setVisible] = React.useState(false);
  const [user, setUser] = React.useState(null);

  let refetchTable: any;

  const showDialog = () => {
    form.resetFields();
    setVisible(true);
  };

  const hideDialog = () => {
    setVisible(false);
  };

  const onCreateClick = () => {
    showDialog();
  };

  const onRemoveClick = async (id: string) => {
    const res = await client.mutate({
      mutation: gql`
        mutation removeUser($id: ID!) {
          removeUser(id: $id)
        }
      `,
      variables: { id },
    });

    if (res.data) {
      refetchTable();
      message.info('User has been removed');
    }
  };

  const compareToFirstPassword = (rule: any, value: any, callback: (input?: string) => void) => {
    if (value && value !== form.getFieldValue('password')) {
      callback('The passwords do not match');
    } else {
      callback();
    }
  };

  const validateToNextPassword = (rule: any, value: any, callback: (input?: string) => void) => {
    if (value && confirmDirty) {
      form.validateFields(['confirm'], { force: true });
    }
    callback();
  };

  const onPasswordBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setConfirmDirty(confirmDirty || !!value);
  };

  const onSubmit = (e: React.FormEvent<HTMLElement>) => {
    e.preventDefault();
    form.validateFieldsAndScroll(async (err, values) => {
      if (!err) {
        const { data } = await client.mutate({
          mutation: gql`
            mutation createUser($email: String!, $password: String, $profile: JSON) {
              createPrimeUser(email: $email, password: $password, profile: $profile)
            }
          `,
          variables: {
            email: values.email,
            password: values.enrollment ? values.password : undefined,
            profile: {
              firstname: values.firstname || '',
              lastname: values.lastname || '',
            },
          },
        });

        if (data && data.createPrimeUser) {
          hideDialog();
          refetchTable();
        }
      }
    });
  };

  const isEditing = false;

  const columns = [
    {
      key: 'name',
      title: 'Name',
      render(text: string, { node }: any) {
        const email = get(node, 'emails.0.address', '');
        const firstname = get(node, 'profile.firstname', '');
        const lastname = get(node, 'profile.lastname', '');
        return (
          <>
            <Avatar style={{ backgroundColor: stringToColor(email), marginRight: 16 }}>
              {firstname.substring(0, 1)}
              {lastname.substring(0, 1)}
            </Avatar>
            {[firstname, lastname].join(' ')}
          </>
        );
      },
    },
    {
      key: 'email',
      title: 'Email',
      render(value: string, record: any) {
        return get(record, 'node.emails.0.address');
      },
    },
    // {
    //   key: 'roles',
    //   title: 'Roles',
    //   render(text: string, record: any) {
    //     return 'N/A';
    //     return record.roles.map((role: string) => startCase(role)).join(', ');
    //   },
    // },
    {
      key: 'actions',
      align: 'right' as any,
      render(text: string, record: any) {
        if (Auth.user!.ability.cannot('delete', 'User')) {
          return null;
        }

        return (
          <span onClick={(e: any) => e.stopPropagation()}>
            <Popconfirm
              title="Are you sure?"
              icon={<Icon type="question-circle-o" style={{ color: 'red' }} />}
              onConfirm={() => onRemoveClick(record.node.id)}
              trigger={record.node.id === Auth.user!.id ? 'contextMenu' : undefined}
            >
              <Button
                style={{ paddingLeft: 8, paddingRight: 8 }}
                disabled={record.node.id === Auth.user!.id}
              >
                <Icon type="delete" theme="filled" />
              </Button>
            </Popconfirm>
          </span>
        );
      },
    },
  ];

  const enrollment = form.getFieldValue('enrollment');

  return (
    <>
      <Query
        client={client}
        query={gql`
          query {
            allUsers {
              edges {
                node {
                  id
                  profile
                  username
                  emails {
                    address
                    verified
                  }
                }
              }
            }
          }
        `}
      >
        {({ data, loading, error, refetch }) => {
          if (error) {
            return null;
          }
          refetchTable = refetch;
          return (
            <Table
              footer={() => (
                <Button
                  disabled={!Auth.user!.ability.can('create', 'User')}
                  onClick={onCreateClick}
                >
                  Create
                </Button>
              )}
              columns={columns}
              dataSource={data && data.allUsers && data.allUsers.edges}
              rowClassName={() => 'prime-row-click'}
              rowKey="id"
              onRow={record => ({
                onClick: () => null,
              })}
            />
          );
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
            {form.getFieldDecorator('firstname')(<Input autoFocus={!isEditing} />)}
          </Form.Item>
          <Form.Item label="Last name">{form.getFieldDecorator('lastname')(<Input />)}</Form.Item>
          <Form.Item label="Email address">
            {form.getFieldDecorator('email', {
              rules: [
                {
                  type: 'email',
                  message: 'Please enter a valid email address',
                },
                {
                  required: true,
                  message: 'Please enter an email address',
                },
              ],
            })(<Input placeholder="Email address" size="large" />)}
          </Form.Item>
          <Form.Item label="Enrollment">
            {form.getFieldDecorator('enrollment', {
              initialValue: false,
              valuePropName: 'checked',
            })(<Switch />)}
          </Form.Item>
          {!enrollment && (
            <>
              <Form.Item label="Password">
                {form.getFieldDecorator('password', {
                  rules: [
                    {
                      required: !enrollment,
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
                    disabled={enrollment}
                    type="password"
                    size="large"
                    placeholder="Password"
                    onBlur={onPasswordBlur}
                  />
                )}
              </Form.Item>
              <Form.Item label="Confirm password">
                {form.getFieldDecorator('confirm', {
                  rules: [
                    {
                      required: !enrollment,
                      message: 'Please confirm the password',
                    },
                    {
                      validator: compareToFirstPassword,
                    },
                  ],
                })(<Input type="password" placeholder="Confirm password" size="large" />)}
              </Form.Item>
            </>
          )}
          {/* <Form.Item label="Roles">
            {form.getFieldDecorator('role')(
              <Select size="large">
                <Select.Option key="admin">Admin</Select.Option>
                <Select.Option key="developer">Developer</Select.Option>
                <Select.Option key="publisher">Publisher</Select.Option>
                <Select.Option key="editor">Editor</Select.Option>
              </Select>
            )}
          </Form.Item> */}
          <div className="prime__drawer__bottom">
            <Button style={{ marginRight: 8 }} onClick={hideDialog}>
              Cancel
            </Button>
            <Button onClick={onSubmit} type="primary" htmlType="submit">
              {isEditing ? 'Save' : 'Create'}
            </Button>
          </div>
        </Form>
      </Drawer>
    </>
  );
});
