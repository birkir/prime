import { IPrimeFieldProps } from '@primecms/field';
import { DatePicker, Form } from 'antd';
import { get, isEmpty } from 'lodash'; // tslint:disable-line no-implicit-dependencies
import moment from 'moment'; // tslint:disable-line no-implicit-dependencies
import * as React from 'react';

interface IState {
  date: any; // tslint:disable-line no-any
}

export class InputComponent extends React.PureComponent<IPrimeFieldProps, IState> {

  public onChange = (date: any) => { // tslint:disable-line no-any
    const { field, form, path } = this.props;
    const isTime = get(field.options, 'time', false);
    form.setFieldsValue({
      [path]: date.format(isTime ? 'YYYY-MM-DD HH:mm:ss' : 'YYYY-MM-DD')
    });
  }

  public render() {
    const { field, form, path, initialValue } = this.props;
    const isTime = get(field.options, 'time', false);

    return (
      <Form.Item label={field.title}>
        <DatePicker
          defaultValue={isEmpty(initialValue) || typeof initialValue !== 'string' ? undefined : moment(initialValue)}
          format={isTime ? 'YYYY-MM-DD HH:mm:ss' : 'YYYY-MM-DD'}
          size="large"
          onChange={this.onChange}
          style={{ minWidth: 280 }}
          showTime={isTime}
        />
        {form.getFieldDecorator(path, { initialValue })(
          <input type="hidden" />
        )}
      </Form.Item>
    );
  }
}
