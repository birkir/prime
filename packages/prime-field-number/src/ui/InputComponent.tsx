import { IPrimeFieldProps } from '@primecms/field';
import { Form, Input } from 'antd';
import * as React from 'react';
import { ValidationRule } from 'antd/lib/form'; // tslint:disable-line

export class InputComponent extends React.PureComponent<IPrimeFieldProps> {
  public render() {
    const { form, field, path, initialValue = false } = this.props;
    const { getFieldDecorator } = form;
    const rules = field.options.rules || {};
    const fieldRules: ValidationRule[] = [];

    if (rules.required) {
      fieldRules.push({
        required: true,
        message: `${field.title} is required`,
      });
    }

    if (rules.min && rules.minValue) {
      const min = Number(rules.minValue);
      fieldRules.push({
        validator: (_, value, cb) =>
          cb(Number(value) >= min ? undefined : `${field.title} must be greater or equal to ${min}`),
      });
    }

    if (rules.max && rules.maxValue) {
      const max = Number(rules.maxValue);
      fieldRules.push({
        validator: (_, value, cb) =>
          cb(Number(value) <= max ? undefined : `${field.title} must be less or equal to ${max}`),
      });
    }

    return (
      <Form.Item label={field.title}>
        {getFieldDecorator(path, { initialValue, rules: fieldRules })(<Input size="large" type="number" />)}
      </Form.Item>
    );
  }
}
