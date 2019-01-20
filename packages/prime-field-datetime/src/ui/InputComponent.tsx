import { IPrimeFieldProps } from '@primecms/field';
import { DatePicker, Form } from 'antd';
import { get, isEmpty } from 'lodash';
import moment from 'moment';
import * as React from 'react';

interface IState {
  value: any;
}

export class InputComponent extends React.PureComponent<IPrimeFieldProps, IState> {
  public onChange = (date: any) => {
    const { field, form, path } = this.props;
    const isTime = get(field.options, 'time', false);
    form.setFieldsValue({
      [path]: date.format(isTime ? 'YYYY-MM-DD HH:mm:ss' : 'YYYY-MM-DD'),
    });
  };

  public render() {
    const { entry, field, form, path, initialValue } = this.props;
    const isTime = get(field.options, 'time', false);
    const value = isEmpty(initialValue) || typeof initialValue !== 'string' ? undefined : moment(initialValue);

    return (
      <Form.Item label={field.title}>
        <DatePicker
          key={(entry && entry.entryId) || 'datepicker'}
          defaultValue={value}
          format={isTime ? 'YYYY-MM-DD HH:mm:ss' : 'YYYY-MM-DD'}
          size="large"
          onChange={this.onChange}
          style={{ minWidth: 280 }}
          showTime={isTime}
        />
        {form.getFieldDecorator(path, { initialValue })(<input type="hidden" />)}
      </Form.Item>
    );
  }
}
