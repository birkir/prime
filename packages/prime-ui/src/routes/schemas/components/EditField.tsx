import React, { useState } from 'react';
import { Form, Button, Input, Select, Row, Col } from 'antd';
import { FormComponentProps } from 'antd/lib/form';
import { camelCase, get } from 'lodash';
import { fields } from '../../../utils/fields';
import stores from '../../../stores';
import { config } from '../../../utils/config';

const { Option } = Select;

interface IProps extends FormComponentProps {
  field: any;
  availableFields: any[];
  onCancel(): void;
  onSubmit(data: any): void;
}

const EditFieldBase = ({ form, onCancel, onSubmit, field, availableFields }: IProps) => {
  const { getFieldDecorator } = form;

  const [autoName, setAutoName] = useState(form.getFieldValue('name') === '');

  const type = form.getFieldValue('type');
  const theField = get(fields, type);
  const SchemaSettingsComponent = get(theField, 'SchemaSettingsComponent', () => null);
  const options = {
    ...(get(theField, 'defaultOptions', {}) || {}),
    ...(get(field, 'options', {}) || {})
  };

  const onFormSubmit = async (e: any) => {
    e.preventDefault();
    const data = form.getFieldsValue();
    const result = {
      ...field,
      ...data,
    }

    if (SchemaSettingsComponent && SchemaSettingsComponent.BEFORE_SUBMIT) {
      SchemaSettingsComponent.BEFORE_SUBMIT(result.options);
    }

    await onSubmit(result);
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
        <Form.Item style={{ marginBottom: 8 }}>
          {getFieldDecorator('title')(
            <Input
              addonBefore="Title"
              onKeyUp={onTitleKeyUp}
              placeholder="Please enter title"
              autoFocus
            />
          )}
        </Form.Item>

        <Form.Item style={{ marginBottom: 8 }}>
          {getFieldDecorator('name')(
            <Input
              addonBefore="API"
              onKeyUp={onNameKeyUp}
              placeholder="Please enter api id"
            />
          )}
        </Form.Item>

        <Form.Item style={{ marginBottom: 8 }}>
          {getFieldDecorator('type')(
            <Select placeholder="Field Type">
              {availableFields.map((field) => (
                <Option value={field.id} key={field.id}>{field.title}</Option>
              ))}
            </Select>
          )}
        </Form.Item>

        <SchemaSettingsComponent
          field={field}
          form={form}
          config={config}
          options={options}
          stores={stores}
        />

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
    const options = get(field, 'options', {}) || {};
    const res: any = {
      title: Form.createFormField({ value: field.title }),
      name: Form.createFormField({ value: field.name }),
      type: Form.createFormField({ value: field.type }),
      // options: Form.createFormField({ value: field.options }),
      optionsJson: Form.createFormField({ value: JSON.stringify(options) }),
    };

    Object.entries(options).forEach(([key, value]) => {
      res[`options.${key}`] = Form.createFormField({ value });
    });

    return res;
  },
})(EditFieldBase);
