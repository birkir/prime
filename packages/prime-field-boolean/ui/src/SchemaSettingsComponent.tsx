import { IPrimeFieldProps } from '@primecms/field';
import { Form, Input } from 'antd';
import * as React from 'react';

type IProps = IPrimeFieldProps & {
  options: {
    label: string;
  };
};

export class SchemaSettingsComponent extends React.PureComponent<IProps> {
  public render() {
    const { form, options } = this.props;

    return (
      <>
        <Form.Item>
          {form.getFieldDecorator('options.label', {
            valuePropName: 'checked',
            initialValue: options.label
          })(
            <Input placeholder="Label" />
          )}
        </Form.Item>
      </>
    );
  }
}
