import React from 'react';
import { Form, Cascader } from 'antd';

function filter(inputValue: any, path: any) {
  return path.some((option: any) => (option.label).toLowerCase().indexOf(inputValue.toLowerCase()) > -1);
}

interface IProps {
  field: any;
  form: any;
  client: any;
  stores: any;
}

export class InputComponent extends React.Component<IProps> {

  state = {
    options: [],
    defaultValue: [],
    loading: false,
  };

  componentDidMount() {
    this.load();
  }

  async load() {
    const { field, form, stores } = this.props;
    this.setState({ loading: true });
    const contentType = await stores.ContentTypes.loadById(field.options.contentTypeId);
    const value = form.getFieldValue(field.name);
    const state = {
      options: [{
        value: contentType.id,
        label: contentType.title,
        isLeaf: false,
      }],
      defaultValue: [] as any,
      loading: false,
    };

    const items = await stores.ContentEntries.loadByContentType(contentType.id);
    (state.options[0] as any).children = items.map((item: any) => ({
      value: item.entryId,
      label: item.data.title || item.data.name || Object.values(item.data)[0],
      isLeaf: true,
    }));

    if (value) {
      state.defaultValue.push(contentType.id, value);
    }

    this.setState(state);
  }

  onChange = (value: any, selectedOptions: any) => {
    const entryId = value.slice(0).pop();
    this.props.form.setFieldsValue({
      [this.props.field.name]: entryId,
    });
  }

  render() {
    const { field, form } = this.props;
    const { getFieldDecorator } = form;
    return (
      <Form.Item label={field.title}>
        {!this.state.loading && (
          <Cascader
            defaultValue={this.state.defaultValue}
            options={this.state.options}
            onChange={this.onChange}
            changeOnSelect
            size="large"
            placeholder="Please select"
            showSearch={{ filter }}
          />
        )}
        {getFieldDecorator(field.name)(<input type="hidden" />)}
      </Form.Item>
    );
  }
}
