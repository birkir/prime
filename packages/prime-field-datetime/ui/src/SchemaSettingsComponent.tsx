import { IPrimeFieldProps } from '@primecms/field';
import { Checkbox, Form } from 'antd';
import * as React from 'react';

type IProps = IPrimeFieldProps & {
  options: {
    date?: boolean;
    time?: boolean;
  };
};

export class SchemaSettingsComponent extends React.PureComponent<IProps> {
  public render() {
    const { form, options = {} } = this.props;

    return (
      <>
        <Form.Item>
          {form.getFieldDecorator('options.date', {
            valuePropName: 'checked',
            initialValue: options.date
          })(
            <Checkbox>Date</Checkbox>
          )}
        </Form.Item>
        <Form.Item>
          {form.getFieldDecorator('options.time', {
            valuePropName: 'checked',
            initialValue: options.time
          })(
            <Checkbox>Time</Checkbox>
          )}
        </Form.Item>
      </>
    );
  }
}
