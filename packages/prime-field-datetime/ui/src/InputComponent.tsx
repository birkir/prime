import { IPrimeFieldProps } from '@primecms/field';
import { DatePicker, Form, TimePicker } from 'antd';
import { get, isEmpty } from 'lodash'; // tslint:disable-line no-implicit-dependencies
import moment from 'moment'; // tslint:disable-line no-implicit-dependencies
import * as React from 'react';

interface IState {
  date: any; // tslint:disable-line no-any
}

export class InputComponent extends React.PureComponent<IPrimeFieldProps, IState> {

  public isTime: Boolean = get(this.props.field.options, 'time', false);

  public state = {
    date: isEmpty(this.props.initialValue) ? undefined : moment(this.props.initialValue)
  };

  public sync = () => {
    const { date} = this.state;
    const { form, path } = this.props;
    if (date) {
      form.setFieldsValue({
        [path]: date.toISOString()
      });
    }
  }

  public onDateChange = (date: any) => { // tslint:disable-line no-any
    this.setState({ date: moment(`${date.format('YYYY-MM-DD')} ${moment(this.state.date).format('HH:mm:ss')}`) }, this.sync);
  }

  public onTimeChange = (time: any) => { // tslint:disable-line no-any
    this.setState({ date: moment(`${moment(this.state.date).format('YYYY-MM-DD')} ${time.format('HH:mm:ss')}`) }, this.sync);
  }

  public render() {
    const { field, form, path, initialValue } = this.props;

    return (
      <Form.Item label={field.title}>
        <DatePicker defaultValue={this.state.date} onChange={this.onDateChange} size="large" style={{ marginRight: 16 }} />
        {this.isTime && <TimePicker defaultValue={this.state.date} onChange={this.onTimeChange} size="large" />}
        {form.getFieldDecorator(path, { initialValue })(
          <input type="hidden" />
        )}
      </Form.Item>
    );
  }
}
