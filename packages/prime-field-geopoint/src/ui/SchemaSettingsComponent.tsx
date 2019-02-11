import { PrimeFieldProps } from '@primecms/field';
import { Form, Switch } from 'antd';
import { get } from 'lodash';
import React from 'react';

type Props = PrimeFieldProps & {
  options: {
    required: boolean;
  };
};

export class SchemaSettingsComponent extends React.PureComponent<Props> {
  public render() {
    const { form, options } = this.props;

    return (
      <>
        <Form.Item label="Options" style={{ marginBottom: -8 }} />
        <Form.Item style={{ margin: 0 }}>
          {form.getFieldDecorator('options.required', {
            valuePropName: 'checked',
            initialValue: get(options, 'required', false),
          })(<Switch />)}
          <label htmlFor="options.required" style={{ marginLeft: 8 }}>
            Required
          </label>
        </Form.Item>
      </>
    );
  }
}
