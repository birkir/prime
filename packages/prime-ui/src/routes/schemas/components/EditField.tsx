import React, { useState } from 'react';
import { Form, Button, Input, Select, Row, Col, Divider } from 'antd';
import { toJS } from 'mobx';
import { FormComponentProps } from 'antd/lib/form';
import { camelCase, get, defaultsDeep } from 'lodash';
import { fields } from '../../../utils/fields';
import stores from '../../../stores';

interface IProps extends FormComponentProps {
  field: any;
  availableFields: any[];
  schema: any;
  onCancel(): void;
  onSubmit(data: any): void;
}

const EditFieldBase = ({ form, onCancel, onSubmit, field, schema, availableFields }: IProps) => {
  const { getFieldDecorator } = form;

  const [autoName, setAutoName] = useState(form.getFieldValue('name') === '');

  const type = form.getFieldValue('type');
  const theField = get(fields, type);
  const SchemaSettingsComponent = get(theField, 'SchemaSettingsComponent', () => null);
  const fromAvailableField = availableFields.find(f => f.id === type);

  const options = defaultsDeep(
    {},
    field ? toJS(field.options) : {},
    fromAvailableField ? toJS(fromAvailableField.defaultOptions) : {}
  );

  const onFormSubmit = async (e: any) => {
    e.preventDefault();
    form.validateFieldsAndScroll(async (error, values) => {
      if (!error) {
        const result = {
          ...field,
          ...values,
        };

        if (SchemaSettingsComponent && SchemaSettingsComponent.BEFORE_SUBMIT) {
          await SchemaSettingsComponent.BEFORE_SUBMIT(result.options);
        }

        await onSubmit(result);
      }
    });
    return false;
  }

  const onNameKeyUp = (e: React.KeyboardEvent<HTMLInputElement>) => {
    setAutoName(e.currentTarget.value === '');
  };

  const onTitleKeyUp = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!autoName) return;
    const name = camelCase(form.getFieldValue('title'));
    let proposedName = name;
    let i = 1;
    while (schema.fields.find((f: any) => f !== field && f.name === proposedName)) {
      proposedName = `${name}${i}`;
      i += 1;
    }
    form.setFieldsValue({
      name: proposedName,
    });
  }

  const ensureUniqueName = (rule: any, value: any, callback: (input?: string) => void) => {
    if (value === 'id') {
      return callback('Forbidden name: id');
    }
    if (value === '_meta') {
      return callback('Forbidden name: _meta');
    }
    const hasMatch = schema.fields.find((f: any) => f !== field && f.name === value);
    callback(hasMatch ? 'Field with that name already exists' : undefined);
  };

  return (
    <>
      <Form
        layout="vertical"
        hideRequiredMark
        onSubmit={onFormSubmit}
      >
        <Form.Item style={{ marginBottom: 8 }}>
          {getFieldDecorator('title', {
            rules: [{ required: true }]
          })(
            <Input
              addonBefore="Title*"
              onKeyUp={onTitleKeyUp}
              placeholder="Please enter title"
              autoFocus
            />
          )}
        </Form.Item>

        <Form.Item style={{ marginBottom: 8 }}>
          {getFieldDecorator('name', {
            rules: [{
              required: true,
            }, {
              pattern: /^[A-Za-z][A-Za-z0-9_]+$/,
              message: 'Must be alphanumeric and start with non-number',
            }, {
              validator: ensureUniqueName
            }]
          })(
            <Input
              addonBefore="API*"
              onKeyUp={onNameKeyUp}
              placeholder="Please enter api name"
            />
          )}
        </Form.Item>

        <Form.Item style={{ marginBottom: 8 }}>
          {getFieldDecorator('description', {
            rules: [{ max: 80 }]
          })(
            <Input
              addonBefore="Description"
              placeholder="(optional)"
            />
          )}
        </Form.Item>

        <Divider dashed />

        <SchemaSettingsComponent
          field={field}
          form={form}
          options={options}
          stores={stores}
        />

        <div className="prime__drawer__bottom">
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
    const res: any = {
      name: Form.createFormField({ value: field.name }),
      title: Form.createFormField({ value: field.title }),
      description: Form.createFormField({ value: field.description }),
      type: Form.createFormField({ value: field.type }),
    };

    const fromAvailableField = props.availableFields.find((f: any) => f.id === field.type);

    const options = defaultsDeep(
      get(field, 'options', {}),
      get(fromAvailableField, 'defaultOptions', {})
    );

    Object.entries(options).forEach(([key, value]) => {
      res[`options.${key}`] = Form.createFormField({ value });
    });

    res.optionsJson = Form.createFormField({ value: JSON.stringify(options) });

    return res;
  },
})(EditFieldBase);
