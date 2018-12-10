import { IPrimeFieldProps } from '@primecms/field';
import { DatePicker, Form, TimePicker } from 'antd';
import { get } from 'lodash'; // tslint:disable-line no-implicit-dependencies
import moment from 'moment'; // tslint:disable-line no-implicit-dependencies
import * as React from 'react';

interface IState {
  date: any; // tslint:disable-line no-any
  time: any; // tslint:disable-line no-any
}

export class InputComponent extends React.PureComponent<IPrimeFieldProps, IState> {

  public isDate: Boolean;
  public isTime: Boolean;

  constructor(props: IPrimeFieldProps) {
    super(props);
    const { field, initialValue } = props;
    const [desiredDate, desiredTime] = String(initialValue || '').split(' ');
    this.isDate = get(field.options, 'date', true);
    this.isTime = get(field.options, 'time', false);

    const state: any = { // tslint:disable-line no-any
      date: undefined,
      time: undefined
    };

    if (this.isDate && desiredDate) {
      state.date = moment(desiredDate);

      if (this.isTime && desiredTime) {
        state.time = moment(`2000-01-01 ${desiredTime}`);
      }
    } else if (this.isTime && desiredDate) {
      state.time = moment(`2000-01-01 ${desiredDate}`);
    }

    this.state = state;
  }

  public update = ({ date, time }: { date?: any; time?: any }) => { // tslint:disable-line no-any
    if (date) {
      this.setState({ date }, this.updateValue);
    } else if (time) {
      this.setState({ time }, this.updateValue);
    }
  }

  public updateValue = () => {
    const { date, time } = this.state;
    const { form, path } = this.props;

    const dateStr = moment(date).format('YYYY-MM-DD');
    const timeStr = moment(time).format('hh:mm:ss');

    form.setFieldsValue({
      [path]: this.isTime
        ? (this.isDate ? moment([dateStr, timeStr].join(' ')).format('YYYY-MM-DD hh:mm:ss') : dateStr)
        : timeStr
    });
  }

  public onDateChange = (date: any) => { // tslint:disable-line no-any
    this.update({ date });
  }

  public onTimeChange = (time: any) => { // tslint:disable-line no-any
    this.update({ time });
  }

  public render() {
    const { field, form, path, initialValue } = this.props;

    return (
      <Form.Item label={field.title}>
        {this.isDate && <DatePicker defaultValue={this.state.date} onChange={this.onDateChange} size="large" style={{ marginRight: 16 }} />}
        {this.isTime && <TimePicker defaultValue={this.state.time} onChange={this.onTimeChange} size="large" />}
        {form.getFieldDecorator(path, { initialValue })(
          <input type="hidden" />
        )}
      </Form.Item>
    );
  }
}
