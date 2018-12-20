import { IPrimeFieldProps } from '@primecms/field';
import { Form, Switch } from 'antd';
import * as React from 'react';

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
        <Form.Item label="Time">
          {form.getFieldDecorator('options.time', {
            valuePropName: 'checked',
            initialValue: options.time
          })(
            <Switch />
          )}
        </Form.Item>
      </>
    );
  }
}
