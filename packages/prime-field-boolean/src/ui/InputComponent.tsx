import { PrimeFieldProps } from '@primecms/field';
import { Form, Switch } from 'antd';
import React from 'react';

export class InputComponent extends React.PureComponent<PrimeFieldProps> {
  public render() {
    const { form, field, path, initialValue = this.props.field.options.default } = this.props;
    const { getFieldDecorator } = form;

    const error = form.getFieldError(path);
    const help =
      field.description && field.description !== ''
        ? `${field.description}${error ? ` - ${error}` : ''}`
        : undefined;

    return (
      <Form.Item label={field.title} help={help}>
        {getFieldDecorator(path, {
          initialValue,
          valuePropName: 'checked',
        })(<Switch />)}
        {field.options.label && field.options.label !== '' && (
          <label htmlFor={path} style={{ marginLeft: 8 }}>
            {field.options.label}
          </label>
        )}
      </Form.Item>
    );
  }
}
