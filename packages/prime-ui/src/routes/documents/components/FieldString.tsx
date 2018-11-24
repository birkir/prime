import React from 'react';
import { Form, Input } from 'antd';

// @todo get this from core via express static

const FieldStringInput = ({ field, form, path }: any) => {
  const { getFieldDecorator } = form;
  return (
    <Form.Item label={field.title}>
      {getFieldDecorator(path || field.name)(
        <Input size="large" />
      )}
    </Form.Item>
  );
}

export const FieldString = {
  component: FieldStringInput,
}
