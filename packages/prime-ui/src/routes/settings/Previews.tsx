import React from 'react';
import { Table, Button, Icon, Popconfirm, Modal, Form, Input, Drawer } from 'antd';
import { Observer } from 'mobx-react';
import { Settings } from '../../stores/settings';

export const Previews = Form.create()(({ form }) => {
  const [isVisible, setVisible] = React.useState(false);
  const [index, setIndex] = React.useState(null);

  const showDialog = ({ name, hostname, pathname }: any = {}, index: number | null = null) => {
    form.setFieldsValue({ name, hostname, pathname });
    setIndex(index as any);
    setVisible(true);
  }

  const hideDialog = () => {
    setVisible(false);
    setIndex(null);
  };

  const isEditing = index !== null && index >= 0;

  const renderFooter = () => (
    <Button onClick={() => showDialog()}>
      Create
    </Button>
  );

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
  }

  return <Observer render={() => (
    <>
      <Table
        dataSource={Settings.previews.slice(0)}
        pagination={false}
        footer={renderFooter}
        rowKey="name"
        columns={[{
          key: 'name',
          title: 'Name',
          dataIndex: 'name',
        }, {
          key: 'hostname',
          title: 'Hostname',
          dataIndex: 'hostname'
        }, {
          key: 'pathname',
          title: 'Path',
          dataIndex: 'pathname',
        }, {
          align: 'right',
          key: 'actions',
          render: (text, record, index) => (
            <>
              <Button
                style={{ paddingLeft: 8, paddingRight: 8, marginRight: 8 }}
                onClick={(e: any) => {
                  e.stopPropagation();
                  showDialog(record, index);
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
                  e.stopPropagation();
                  Settings.removePreview(record);
                  Settings.save();
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
        title={`${isEditing ? 'Edit' : 'Create'} Preview`}
        width={360}
        placement="right"
        maskClosable={true}
        onClose={hideDialog}
        visible={isVisible}
        style={{
          height: 'calc(100% - 55px)',
          overflow: 'auto',
          paddingBottom: 53,
        }}
      >
        <Form onSubmit={onSubmit}>
          <Form.Item label="Name">
            {form.getFieldDecorator('name', {
              rules: [{ required: true }]
            })(
              <Input placeholder="eg. Staging" />
            )}
          </Form.Item>
          <Form.Item label="Preview URL">
            {form.getFieldDecorator('hostname', {
              rules: [{
                required: true
              }, {
                type: 'url',
                message: 'Must a valid URL',
              }]
            })(
              <Input placeholder="https://yoursite.com" />
            )}
          </Form.Item>
          <Form.Item label="Preview Path">
            {form.getFieldDecorator('pathname')(
              <Input placeholder="/preview" />
            )}
          </Form.Item>
          <div
            style={{
              position: 'absolute',
              bottom: 0,
              width: '100%',
              borderTop: '1px solid #e8e8e8',
              padding: '10px 16px',
              textAlign: 'right',
              left: 0,
              background: '#fff',
              borderRadius: '0 0 4px 4px',
            }}
          >
            <Button style={{ marginRight: 8 }} onClick={hideDialog}>Cancel</Button>
            <Button onClick={onSubmit} type="primary" htmlType="submit">{isEditing ? 'Save' : 'Create'}</Button>
          </div>
        </Form>
      </Drawer>
    </>
  )} />;
});
