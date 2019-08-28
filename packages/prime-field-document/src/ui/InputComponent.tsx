import { PrimeFieldProps } from '@primecms/field';
import { Form, TreeSelect } from 'antd';
import React from 'react';
import { get } from 'lodash';

interface IContentType {
  documentId: string;
  primary: string;
}

interface IOption {
  key: string;
  value: string;
  title: string;
  isLeaf: boolean;
  children?: IOption[];
}

interface IState {
  options: IOption[];
  loading: boolean;
}

export class InputComponent extends React.Component<PrimeFieldProps, IState> {
  public state: IState = {
    options: [],
    loading: false,
  };

  public componentDidMount() {
    this.load().catch((err: Error) => {
      console.error(err); // tslint:disable-line no-console
    });
  }

  public async load() {
    const { field, stores } = this.props;

    this.setState({ loading: true });

    const contentTypeIds = field.options.schemaIds || [];
    if (field.options.contentTypeId) {
      contentTypeIds.push(field.options.schemaId);
    }

    const contentTypes = await Promise.all(
      contentTypeIds.map(async (contentTypeId: string) => {
        const contentType = await stores.ContentTypes.loadById(contentTypeId);
        const items = await stores.ContentEntries.loadByContentType(contentType.id);

        return { contentType, items };
      })
    );

    this.setState({
      options: contentTypes.map(({ contentType, items }: any) => ({
        key: contentType.id,
        value: contentType.id,
        title: contentType.title,
        selectable: false,
        isLeaf: false,
        children: items.map((item: IContentType) => ({
          key: item.documentId,
          value: [contentType.id, item.documentId].join(','),
          title: item.primary,
          isLeaf: true,
        })),
      })),
      loading: false,
    });
  }

  get defaultValue() {
    const { field, initialValue } = this.props;
    const { multiple = false } = field.options;

    if (multiple) {
      if (typeof initialValue === 'string') {
        return [initialValue];
      } else if (Array.isArray(initialValue)) {
        return [].concat(initialValue || []);
      }
    } else if (initialValue) {
      return Array.isArray(initialValue) ? initialValue[0] : initialValue;
    }
  }

  public onChange = (value: string | string[]) => {
    this.props.form.setFieldsValue({
      [this.props.path]: value,
    });
  };

  public render() {
    const { loading, options } = this.state;
    const { field, document, path, form, initialValue } = this.props;
    const { getFieldDecorator } = form;
    const required = get(field.options, 'required', false);

    return (
      <Form.Item label={field.title}>
        {!loading
          ? getFieldDecorator(path, {
              initialValue,
            })(
              <TreeSelect
                key={(document && document.documentId) || 'picker'}
                style={{ width: 300 }}
                defaultValue={this.defaultValue}
                dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
                showSearch={true}
                size="large"
                treeData={options}
                placeholder="Pick document(s)"
                multiple={field.options.multiple || false}
                treeNodeFilterProp="title"
                onChange={this.onChange}
                allowClear={!required}
              />
            )
          : null}
      </Form.Item>
    );
  }
}
