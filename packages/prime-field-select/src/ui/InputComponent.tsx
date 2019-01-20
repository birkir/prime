import { IPrimeFieldProps } from '@primecms/field';
import { Form, Select } from 'antd';
import { get } from 'lodash';
import * as React from 'react';

export class InputComponent extends React.PureComponent<IPrimeFieldProps> {
  public componentDidMount() {
    if (this.props.form.getFieldValue(this.props.path) === '') {
      this.props.form.setFieldsValue({
        [this.props.path]: undefined,
      });
    }
  }

  public render() {
    const { form, field, path, initialValue } = this.props;
    const { getFieldDecorator } = form;
    const items = get(field.options, 'items', []);
    const required = get(field.options, 'required', false);
    const multiple = get(field.options, 'multiple', false);

    return (
      <Form.Item label={field.title}>
        {getFieldDecorator(path, {
          initialValue,
          rules: required ? [{ required: true }] : undefined,
        })(
          <Select
            placeholder={field.description && field.description !== '' ? field.description : 'Select item'}
            allowClear={!required}
            mode={multiple ? 'multiple' : undefined}
          >
            {items
              .filter((n: any) => !!n)
              .map((
                { key, value }: any // tslint:disable-line no-any
              ) => (
                <Select.Option key={key}>{value}</Select.Option>
              ))}
          </Select>
        )}
      </Form.Item>
    );
  }
}
