import React from 'react';
import { Table, Button, Icon, Popconfirm, Modal, Form, Input, Drawer, Select, Tooltip } from 'antd';
import { Observer } from 'mobx-react';
import { Settings } from '../../stores/settings';
import countries from './countries.json';

export const Locales = Form.create()(({ form }) => {
  const [isVisible, setVisible] = React.useState(false);
  const [index, setIndex] = React.useState(null);

  const showDialog = ({ id, name, flag }: any = {}, index: number | null = null) => {
    form.setFieldsValue({ id, name, flag });
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
    (values as any).flag = ((values as any).flag.split(',') || []).pop();
    if (isEditing) {
      Settings.locales[Number(index)].update(values);
    } else {
      Settings.addLocale(values);
    }
    Settings.save();
    hideDialog();
  }

  return <Observer render={() => (
    <>
      <Table
        dataSource={Settings.locales.slice(0)}
        pagination={false}
        footer={renderFooter}
        rowKey="name"
        columns={[{
          key: 'id',
          title: 'ID',
          dataIndex: 'id',
          width: '120px',
        }, {
          key: 'name',
          title: 'Name',
          dataIndex: 'name',
          render: (text, record) => {
            return <span>
              <span className={`flagstrap-icon flagstrap-${record.flag}`} style={{ marginRight: 16 }} />
              {text}
            </span>
          },
        }, {
          align: 'right',
          key: 'actions',
          render: (text, record, index) => (
            <>
              <Popconfirm
                title={<><strong>Use as master?</strong><p>All documents will resolve to this<br />locale if none is specified.</p></>}
                icon={<Icon type="question-circle-o" style={{ color: 'red' }} />}
                onConfirm={() => {
                  Settings.setMasterLocale(record);
                  Settings.save();
                }}
              >
                <Tooltip title="">
                  <Button  style={{ paddingLeft: 8, paddingRight: 8, marginRight: 8 }} disabled={record.master}>
                    <Icon type="star" theme={record.master ? 'filled' : 'outlined'} />
                  </Button>
                </Tooltip>
              </Popconfirm>
              <Button
                style={{ paddingLeft: 8, paddingRight: 8, marginRight: 8 }}
                onClick={() => showDialog(record, index)}
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
                  Settings.removePreview(record);
                  Settings.save();
                }}
              >
                <Button style={{ paddingLeft: 8, paddingRight: 8 }} onClick={(e: any) => e.stopPropagation()} disabled={record.master}>
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
        title={`${isEditing ? 'Edit' : 'Create'} Locale`}
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
          <Form.Item label="ID">
            {form.getFieldDecorator('id', {
              rules: [{
                required: true,
              }]
            })(
              <Input disabled={isEditing} placeholder="eg. en-GB" />
            )}
          </Form.Item>
          <Form.Item label="Name">
            {form.getFieldDecorator('name', {
              rules: [{
                required: true
              }]
            })(
              <Input placeholder="eg. English (GB)" />
            )}
          </Form.Item>
          <Form.Item label="Flag">
            {form.getFieldDecorator('flag', {
              rules: [{ required: true }]
            })(
              <Select
                size="large"
                placeholder="Select country flag"
                showSearch
                filterOption={(input, option: any) => option.key.indexOf(input.toLowerCase()) >= 0}
              >
                {Object.entries(countries).map(([key, country]) => (
                  <Select.Option key={country.toLowerCase() + ',' + key.toLowerCase()}>
                    <span className={`flagstrap-icon flagstrap-${key.toLowerCase()}`} style={{ marginRight: 8 }} />
                    {country}
                  </Select.Option>)
                )}
              </Select>
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
