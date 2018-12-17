import { IPrimeFieldProps } from '@primecms/field';
import { Form, Switch } from 'antd';
import * as React from 'react';

type IProps = IPrimeFieldProps & {
  options: {
    float: boolean;
  };
};

export class SchemaSettingsComponent extends React.PureComponent<IProps> {
  public render() {
    const { form, options } = this.props;

    return (
      <>
        <Form.Item label="Floating Point">
          {form.getFieldDecorator('options.float', {
            valuePropName: 'checked',
            initialValue: options.float
          })(
            <Switch />
          )}
        </Form.Item>
      </>
    );
  }
}
