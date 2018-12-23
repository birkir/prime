import { IPrimeFieldProps } from '@primecms/field';
import { Form, Switch } from 'antd';
import * as React from 'react';

export class InputComponent extends React.PureComponent<IPrimeFieldProps> {

  public render() {
    const { form, field, path, initialValue = false } = this.props;
    const { getFieldDecorator } = form;

    return (
      <Form.Item label={field.title}>
        {getFieldDecorator(path, {
          initialValue,
          valuePropName: 'checked'
        })(
          <Switch />
        )}
        {field.description && field.description !== '' && (
          <label htmlFor={path} style={{ marginLeft: 8 }}>{field.description}</label>
        )}
      </Form.Item>
    );
  }
}
