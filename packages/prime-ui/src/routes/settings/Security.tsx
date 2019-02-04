import { Button, Form, message, Select } from 'antd';
import React from 'react';
import { Settings } from '../../stores/settings';

export const Security = Form.create()(({ form }) => {
  const onSubmit = (e: any) => {
    e.preventDefault();
    Settings.setAccessType(form.getFieldValue('accessType'));
    Settings.save();
    message.success('Settings have been saved');
  };

  return (
    <>
      <Form onSubmit={onSubmit}>
        <Form.Item label="API Access">
          {form.getFieldDecorator('accessType', { initialValue: Settings.accessType })(
            <Select style={{ width: 150 }}>
              <Select.Option key="PUBLIC">Public</Select.Option>
              <Select.Option key="PRIVATE">Private</Select.Option>
            </Select>
          )}
        </Form.Item>
        <Button htmlType="submit">Save</Button>
      </Form>
    </>
  );
});
