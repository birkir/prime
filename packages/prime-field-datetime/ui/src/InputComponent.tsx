import { IPrimeFieldProps } from '@primecms/field';
import { DatePicker, Form, TimePicker } from 'antd';
import moment from 'moment'; // tslint:disable-line no-implicit-dependencies
import * as React from 'react';

interface IState {
  date: any; // tslint:disable-line no-any
  time: any; // tslint:disable-line no-any
}

export class InputComponent extends React.PureComponent<IPrimeFieldProps, IState> {

  constructor(props: IPrimeFieldProps) {
    super(props);
    const { field, initialValue  } = props;
    const [desiredDate, desiredTime] = String(initialValue || '').split(' ');

    const state: any = { // tslint:disable-line no-any
      date: undefined,
      time: undefined
    };

    if (field.options.date && desiredDate) {
      state.date = moment(desiredDate);

      if (field.options.time && desiredTime) {
        state.time = moment(`2000-01-01 ${desiredTime}`);
      }
    } else if (field.options.time && desiredDate) {
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
    const { form, field, path } = this.props;

    const dateStr = moment(date).format('YYYY-MM-DD');
    const timeStr = moment(time).format('hh:mm:ss');

    form.setFieldsValue({
      [path]: field.options.time
        ? (field.options.date ? moment([dateStr, timeStr].join(' ')).format('YYYY-MM-DD hh:mm:ss') : dateStr)
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
    const { date, time } = field.options;

    return (
      <Form.Item label={field.title}>
        {date && <DatePicker defaultValue={this.state.date} onChange={this.onDateChange} size="large" />}
        {time && <TimePicker defaultValue={this.state.time} onChange={this.onTimeChange} size="large" />}
        {form.getFieldDecorator(path, { initialValue })(
          <input type="hidden" />
        )}
      </Form.Item>
    );
  }
}
