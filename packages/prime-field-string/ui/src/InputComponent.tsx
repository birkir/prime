import { IPrimeFieldProps } from '@primecms/field';
import { Form, Input } from 'antd';
import * as React from 'react';

export class InputComponent extends React.PureComponent<IPrimeFieldProps> {
  public render() {
    const { form, field, path, initialValue = '' } = this.props;
    const { getFieldDecorator } = form;

    return (
      <Form.Item label={field.title}>
        {getFieldDecorator(typeof path === 'string' ? path : field.name, { initialValue })(
          <Input size="large" />
        )}
      </Form.Item>
    );
  }
}
