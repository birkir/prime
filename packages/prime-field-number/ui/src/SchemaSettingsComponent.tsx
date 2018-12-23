import { IPrimeFieldProps } from '@primecms/field';
import { Form, Input, Switch } from 'antd';
import { get } from 'lodash';
import * as React from 'react';

type IProps = IPrimeFieldProps & {
  options: {
    float: boolean;
    rules?: {
      required: boolean;
      min: boolean;
      minValue: number;
      max: boolean;
      maxValue: number;
    };
  };
};

export class SchemaSettingsComponent extends React.PureComponent<IProps> {
  public render() {
    const { form, options } = this.props;

    return (
      <>
        <Form.Item label="Options" style={{ marginBottom: -8 }} />
        <Form.Item style={{ margin: 0 }}>
          {form.getFieldDecorator('options.float', {
            valuePropName: 'checked',
            initialValue: get(options, 'rules.float', false)
          })(
            <Switch />
          )}
          <label htmlFor="options.float" style={{ marginLeft: 8 }}>Floating point</label>
        </Form.Item>
        <Form.Item style={{ margin: 0 }}>
          {form.getFieldDecorator('options.rules.required', {
            valuePropName: 'checked',
            initialValue: get(options, 'rules.required', false)
          })(
            <Switch />
          )}
          <label htmlFor="options.rules.required" style={{ marginLeft: 8 }}>Required</label>
        </Form.Item>
        <div>
          <Form.Item style={{ margin: 0, display: 'inline-flex' }}>
            {form.getFieldDecorator('options.rules.min', {
              valuePropName: 'checked',
              initialValue: get(options, 'rules.min', false)
            })(
              <Switch />
            )}
            <label htmlFor="options.rules.min" style={{ marginLeft: 8 }}>Min: </label>
          </Form.Item>
          <Form.Item style={{ margin: 0, marginLeft: 8, display: 'inline-flex' }}>
            {form.getFieldDecorator('options.rules.minValue', {
              initialValue: get(options, 'rules.minValue')
            })(
              <Input size="small" type="number" style={{ width: 64 }} />
            )}
          </Form.Item>
        </div>
        <div>
          <Form.Item style={{ margin: 0, display: 'inline-flex' }}>
            {form.getFieldDecorator('options.rules.max', {
              valuePropName: 'checked',
              initialValue: get(options, 'rules.max', false)
            })(
              <Switch />
            )}
            <label htmlFor="options.rules.max" style={{ marginLeft: 8 }}>Max: </label>

          </Form.Item>
          <Form.Item style={{ margin: 0, marginLeft: 8, display: 'inline-flex' }}>
            {form.getFieldDecorator('options.rules.maxValue', {
              initialValue: get(options, 'rules.maxValue')
            })(
              <Input size="small" type="number" style={{ width: 64 }} />
            )}
          </Form.Item>
        </div>
      </>
    );
  }
}
