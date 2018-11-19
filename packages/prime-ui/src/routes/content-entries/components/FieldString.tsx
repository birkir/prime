import React from 'react';
import { Form, Input } from 'antd';

export const FieldString = ({ field, value }: any) => (
  <Form.Item
    label={field.title || field.name}
  >
    <Input value={value || ''} />
  </Form.Item>
)
