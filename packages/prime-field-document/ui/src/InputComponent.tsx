import { IPrimeFieldProps } from '@primecms/field';
import { Cascader, Form } from 'antd';
import * as React from 'react';

function filter(inputValue: string, path: { label: string }[]) {
  return path.some((option: { label: string }) => (option.label).toLowerCase().indexOf(inputValue.toLowerCase()) > -1);
}

interface IContentType {
  entryId: string;
  display: string;
}

interface IOption {
  value: string;
  label: string;
  isLeaf: boolean;
  children?: IOption[];
}

interface IState {
  options: IOption[];
  defaultValue: string[];
  loading: boolean;
}

export class InputComponent extends React.Component<IPrimeFieldProps, IState> {

  public state: IState = {
    options: [],
    defaultValue: [],
    loading: false
  };

  public componentDidMount() {
    this.load()
      .catch((err: Error) => {
        console.error(err); // tslint:disable-line no-console
      });
  }

  public async load() {
    const { field, stores, initialValue } = this.props;

    this.setState({ loading: true });

    const contentType = await stores.ContentTypes.loadById(field.options.contentTypeId);
    const items = await stores.ContentEntries.loadByContentType(contentType.id);
    const value = initialValue;

    const state: IState = {
      options: [{
        value: contentType.id,
        label: contentType.title,
        isLeaf: false,
        children: items.map((item: IContentType) => ({
          value: item.entryId,
          label: item.display,
          isLeaf: true
        }))
      }],
      defaultValue: [],
      loading: false
    };

    if (value) {
      state.defaultValue.push(contentType.id, value);
    }

    this.setState(state);
  }

  public onChange = (value: string[]) => {
    const entryId = value.slice(0).pop();
    this.props.form.setFieldsValue({
      [this.props.path]: entryId
    });
  }

  public render() {
    const { loading, defaultValue, options } = this.state;
    const { field, path, form, initialValue } = this.props;
    const { getFieldDecorator } = form;

    return (
      <Form.Item label={field.title}>
        {loading === false ? (
          <Cascader
            defaultValue={defaultValue}
            options={options}
            onChange={this.onChange}
            changeOnSelect
            size="large"
            placeholder="Please select"
            showSearch={{ filter } as any} // tslint:disable-line no-any
          />
        ) : null}
        {getFieldDecorator(path, {
          initialValue
        })(<input type="hidden" />)}
      </Form.Item>
    );
  }
}
