import React, { useState } from 'react';
import { Form, Button, Input, Select } from 'antd';
import { FormComponentProps } from 'antd/lib/form';
import { camelCase } from 'lodash';

const { Option } = Select;
const { TextArea } = Input;

interface IProps extends FormComponentProps {
  field: any;
  availableFields: any[];
  onCancel(): void;
  onSubmit(data: any): void;
}

const EditFieldBase = ({ form, onCancel, onSubmit, field, availableFields }: IProps) => {
  const { getFieldDecorator } = form;

  const [autoName, setAutoName] = useState(form.getFieldValue('name') === '');

  const onFormSubmit = async (e: any) => {
    e.preventDefault();
    const data = form.getFieldsValue();
    const result = {
      ...field,
      ...data,
    }
    onSubmit(result);
    return false;
  }

  const onNameKeyUp = (e: React.KeyboardEvent<HTMLInputElement>) => {
    setAutoName(e.currentTarget.value === '');
  };

  const onTitleKeyUp = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!autoName) return;
    form.setFieldsValue({
      name: camelCase(form.getFieldValue('title')),
    });
  }

  return (
    <>
      <Form
        layout="vertical"
        hideRequiredMark
        onSubmit={onFormSubmit}
      >
        <Form.Item label="Title">
          {getFieldDecorator('title')(
            <Input
              onKeyUp={onTitleKeyUp}
              placeholder="Please enter title"
            />
          )}
        </Form.Item>
        <Form.Item label="API">
          {getFieldDecorator('name')(
            <Input
              onKeyUp={onNameKeyUp}
              placeholder="Please enter api id"
            />
          )}
        </Form.Item>
        <Form.Item label="Type">
          {getFieldDecorator('type')(
            <Select placeholder="Please select type">
              {availableFields.map((field) => (
                <Option value={field.id} key={field.id}>{field.title}</Option>
              ))}
            </Select>
          )}
        </Form.Item>
        <Form.Item label="Options">
          {getFieldDecorator('options', {
            rules: [{
              validator(rule, value, callback) {
                try { JSON.parse(value); } catch (err) {
                  callback('Invalid JSON');
                }
                callback();
              },
            }]
          })(
            <TextArea />
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
          <Button style={{ marginRight: 8 }} onClick={onCancel}>Cancel</Button>
          <Button onClick={onFormSubmit} type="primary" htmlType="submit">Save</Button>
        </div>
      </Form>
    </>
  );
}

export const EditField = Form.create({
  mapPropsToFields(props: any) {
    const { field } = props;
    return {
      title: Form.createFormField({ value: field.title }),
      name: Form.createFormField({ value: field.name }),
      type: Form.createFormField({ value: field.type }),
      options: Form.createFormField({ value: JSON.stringify(field.options || {}) }),
    };
  },
})(EditFieldBase);
