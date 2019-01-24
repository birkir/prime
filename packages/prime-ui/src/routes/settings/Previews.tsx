import { Button, Drawer, Form, Icon, Input, Modal, Popconfirm, Table } from 'antd';
import { Observer } from 'mobx-react';
import React from 'react';
import { Settings } from '../../stores/settings';

export const Previews = Form.create()(({ form }) => {
  const [isVisible, setVisible] = React.useState(false);
  const [index, setIndex] = React.useState(null as null | number);

  const showDialog = ({ name, hostname, pathname }: any = {}, i: number | null = null) => {
    form.setFieldsValue({ name, hostname, pathname });
    setIndex(i);
    setVisible(true);
  };

  const hideDialog = () => {
    setVisible(false);
    setIndex(null);
  };

  const isEditing = index !== null && index >= 0;

  const renderFooter = () => <Button onClick={() => showDialog()}>Create</Button>;

  const onSubmit = (e: any) => {
    e.preventDefault();
    const values = form.getFieldsValue();
    if (isEditing) {
      Settings.previews[Number(index)].update(values);
    } else {
      Settings.addPreview(values);
    }
    Settings.save();
    hideDialog();
  };

  return (
    <Observer
      render={() => (
        <>
          <Table
            dataSource={Settings.previews.slice(0)}
            pagination={false}
            footer={renderFooter}
            rowKey="name"
            columns={[
              {
                key: 'name',
                title: 'Name',
                dataIndex: 'name',
              },
              {
                key: 'hostname',
                title: 'Hostname',
                dataIndex: 'hostname',
              },
              {
                key: 'pathname',
                title: 'Path',
                dataIndex: 'pathname',
              },
              {
                align: 'right',
                key: 'actions',
                render: (text, record, i) => (
                  <>
                    <Button
                      style={{ paddingLeft: 8, paddingRight: 8, marginRight: 8 }}
                      onClick={(e: any) => {
                        e.stopPropagation();
                        showDialog(record, i);
                      }}
                    >
                      <Icon type="edit" theme="filled" />
                    </Button>
                    <Popconfirm
                      title="Are you sure?"
                      icon={<Icon type="question-circle-o" style={{ color: 'red' }} />}
                      onConfirm={(e: any) => {
                        e.stopPropagation();
                        Settings.removePreview(record);
                        Settings.save();
                      }}
                      onCancel={(e: any) => {
                        e.stopPropagation();
                      }}
                    >
                      <Button style={{ paddingLeft: 8, paddingRight: 8 }} onClick={(e: any) => e.stopPropagation()}>
                        <Icon type="delete" theme="filled" />
                      </Button>
                    </Popconfirm>
                  </>
                ),
              },
            ]}
          />
          <Drawer
            title={`${isEditing ? 'Edit' : 'Create'} Preview`}
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
                  rules: [{ required: true }],
                })(<Input autoFocus={!isEditing} size="large" placeholder="eg. Staging" />)}
              </Form.Item>
              <Form.Item label="Preview URL">
                {form.getFieldDecorator('hostname', {
                  rules: [
                    {
                      required: true,
                    },
                    {
                      type: 'url',
                      message: 'Must be a valid URL',
                    },
                  ],
                })(<Input size="large" placeholder="https://yoursite.com" />)}
              </Form.Item>
              <Form.Item label="Preview Path">
                {form.getFieldDecorator('pathname')(<Input size="large" placeholder="/preview" />)}
              </Form.Item>
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
      )}
    />
  );
});
