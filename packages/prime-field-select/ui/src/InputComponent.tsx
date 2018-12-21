import { IPrimeFieldProps } from '@primecms/field';
import { Form, Select } from 'antd';
import { get } from 'lodash';
import * as React from 'react';

export class InputComponent extends React.PureComponent<IPrimeFieldProps> {

  public render() {
    const { form, field, path, initialValue = false } = this.props;
    const { getFieldDecorator } = form;
    const items = get(field.options, 'items', []);

    return (
      <Form.Item label={field.title}>
        {getFieldDecorator(path, { initialValue })(
          <Select>
            {items.map(({ key, value }: any) => (
              <Select.Option key={key}>{value}</Select.Option>
            ))}
          </Select>
        )}
      </Form.Item>
    );
  }
}
