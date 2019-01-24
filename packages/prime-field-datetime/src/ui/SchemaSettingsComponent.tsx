import { IPrimeFieldProps } from '@primecms/field';
import { Form, Switch } from 'antd';
import React from 'react';

type IProps = IPrimeFieldProps & {
  options: {
    time?: boolean;
  };
};

export class SchemaSettingsComponent extends React.PureComponent<IProps> {
  public render() {
    const { form, options = {} } = this.props;

    return (
      <>
        <Form.Item label="Options" style={{ marginBottom: -8 }} />
        <Form.Item>
          {form.getFieldDecorator('options.time', {
            valuePropName: 'checked',
            initialValue: options.time,
          })(<Switch />)}
          <label htmlFor="options.time" style={{ marginLeft: 8 }}>
            Show time picker
          </label>
        </Form.Item>
      </>
    );
  }
}
