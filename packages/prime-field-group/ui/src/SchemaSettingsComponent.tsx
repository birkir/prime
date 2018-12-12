import { IPrimeFieldProps } from '@primecms/field';
import { Checkbox, Form } from 'antd';
import * as React from 'react';

type IProps = IPrimeFieldProps & {
  options: {
    repeated?: boolean;
  };
};

export class SchemaSettingsComponent extends React.PureComponent<IProps> {
  public render() {
    const { form, options = {} } = this.props;

    return (
      <>
        <Form.Item>
          {form.getFieldDecorator('options.repeated', {
            valuePropName: 'checked',
            initialValue: options.repeated
          })(
            <Checkbox>Repeated</Checkbox>
          )}
        </Form.Item>
      </>
    );
  }
}
