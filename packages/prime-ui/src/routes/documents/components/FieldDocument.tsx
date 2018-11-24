import React from 'react';
import { Form, Cascader } from 'antd';
import { ContentTypes } from '../../../stores/contentTypes';
import { ContentEntries } from '../../../stores/contentEntries';

// @todo get this from core via express static

function filter(inputValue: any, path: any) {
  return path.some((option: any) => (option.label).toLowerCase().indexOf(inputValue.toLowerCase()) > -1);
}

class FieldDocumentInput extends React.Component<any> {

  state = {
    options: [],
    defaultValue: [],
    loading: false,
  };

  componentDidMount() {
    this.load();
  }

  async load() {
    const { field, form } = this.props;
    this.setState({ loading: true });
    const contentType = await ContentTypes.loadById(field.options.contentTypeId);
    const value = form.getFieldValue(field.name);
    const state = {
      options: [{
        value: contentType.id,
        label: contentType.title,
        isLeaf: false,
        // children: [],
      }],
      defaultValue: [] as any,
      loading: false,
    };

    const items = await ContentEntries.loadByContentType(contentType.id);
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
    const { field, form, path } = this.props;
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

export const FieldDocument = {
  component: FieldDocumentInput,
}
