import React from 'react';
import { Table, Button, Icon, Popconfirm, Form, Input, Drawer, Select, Badge, message } from 'antd';
import { Observer } from 'mobx-react';
import { Instance } from 'mobx-state-tree';
import { Webhook } from '../../stores/models/Webhook';
import stores from '../../stores';

export const Webhooks = Form.create()(({ form }) => {
  const [isVisible, setVisible] = React.useState(false);
  const [webhook, setWebhook] = React.useState(null as Instance<typeof Webhook> | null);

  React.useEffect(() => { stores.Webhooks.loadAll() }, []);

  const showDialog = (webhook?: Instance<typeof Webhook>) => {
    if (!webhook) {
      form.resetFields();
    } else {
      setWebhook(webhook);
      const { name, url, method = 'POST' } = webhook;
      form.setFieldsValue({ name, url, method });
    }
    setVisible(true);
  }

  const hideDialog = () => {
    setVisible(false);
    setWebhook(null);
  };

  const isEditing = webhook !== null;

  const renderFooter = () => (
    <Button onClick={() => showDialog()}>
      Create
    </Button>
  );

  const onSubmit = (e: any) => {
    e.preventDefault();
    form.validateFieldsAndScroll(async (error, values) => {
      if (!error) {
        try {
          if (isEditing && webhook) {
            await webhook.update(values);
          } else {
            await stores.Webhooks.create(values);
          }
          hideDialog();
        } catch (err) {
          message.error(err.message);
        }
      }
    });
  }

  return <Observer render={() => (
    <>
      <Table
        dataSource={stores.Webhooks.list}
        pagination={false}
        footer={renderFooter}
        rowKey="name"
        columns={[{
          key: 'name',
          title: 'Name',
          dataIndex: 'name',
        }, {
          key: 'url',
          title: 'Url',
          dataIndex: 'url'
        }, {
          key: 'method',
          title: 'Method',
          dataIndex: 'method',
        }, {
          key: '',
          title: 'Successful calls',
          render(text, record) {
            const empty = record.count === 0;
            const ratio = record.count / record.success;
            const status = (() => {
              if (empty) return 'default';
              if (ratio === 1) return 'success';
              if (ratio > 0.9) return 'warning';
              return 'error';
            })();
            return <Badge status={status} text={empty ? 'n/a' : `${Math.floor(ratio * 100)}%`} />;
          },
        }, {
          align: 'right',
          key: 'actions',
          render: (text, record, index) => (
            <>
              <Button
                style={{ paddingLeft: 8, paddingRight: 8, marginRight: 8 }}
                onClick={(e: any) => {
                  e.stopPropagation();
                  showDialog(record);
                }}
              >
                <Icon
                  type="edit"
                  theme="filled"
                />
              </Button>
              <Popconfirm
                title="Are you sure?"
                icon={<Icon type="question-circle-o" style={{ color: 'red' }} />}
                onConfirm={(e: any) => {
                  stores.Webhooks.remove(record);
                  e.stopPropagation();
                }}
                onCancel={(e: any) => {
                  e.stopPropagation();
                }}
              >
                <Button style={{ paddingLeft: 8, paddingRight: 8 }} onClick={(e: any) => e.stopPropagation()}>
                  <Icon
                    type="delete"
                    theme="filled"
                  />
                </Button>
              </Popconfirm>
            </>
          )
        }]}
      />
      <Drawer
        title={`${isEditing ? 'Edit' : 'Create'} Webhook`}
        width={360}
        placement="right"
        maskClosable={true}
        onClose={hideDialog}
        visible={isVisible}
        className="prime__drawer"
      >
        <Form onSubmit={onSubmit}>
          <Form.Item label="Name">
            {form.getFieldDecorator('name', {
              rules: [{ required: true }]
            })(
              <Input autoFocus={!isEditing} size="large" />
            )}
          </Form.Item>
          <Form.Item label="URL">
            {form.getFieldDecorator('url', {
              rules: [{
                required: true
              }, {
                type: 'url',
                message: 'Must be a valid URL',
              }]
            })(
              <Input size="large" placeholder="https://yoursite.com" />
            )}
          </Form.Item>
          <Form.Item label="Method">
            {form.getFieldDecorator('method', {
              rules: [{ required: true }],
              initialValue: 'POST',
            })(
              <Select size="large">
                <Select.Option key="POST">POST</Select.Option>
                <Select.Option key="GET">GET</Select.Option>
                <Select.Option key="PUT">PUT</Select.Option>
                <Select.Option key="PATCH">PATCH</Select.Option>
                <Select.Option key="DELETE">DELETE</Select.Option>
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
  )} />;
});
