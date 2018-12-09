import { IPrimeFieldProps } from '@primecms/field';
import { Checkbox, Form } from 'antd';
import * as React from 'react';

type IProps = IPrimeFieldProps & {
  options: {
    multiline?: boolean;
    markdown?: boolean;
  };
};

export class SchemaSettingsComponent extends React.PureComponent<IProps> {
  public render() {
    const { form, options = {} } = this.props;

    return (
      <>
        <Form.Item>
          {form.getFieldDecorator('options.multiline', {
            valuePropName: 'checked',
            initialValue: options.multiline
          })(
            <Checkbox>Multiline</Checkbox>
          )}
        </Form.Item>
        <Form.Item>
          {form.getFieldDecorator('options.markdown', {
            valuePropName: 'checked',
            initialValue: options.markdown
          })(
            <Checkbox>Markdown</Checkbox>
          )}
        </Form.Item>
      </>
    );
  }
}
