import { IPrimeFieldProps } from '@primecms/field';
import { Form, TreeSelect } from 'antd';
import * as React from 'react';

interface IContentType {
  entryId: string;
  display: string;
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
  defaultValue: undefined | string | string[];
  loading: boolean;
}

export class InputComponent extends React.Component<IPrimeFieldProps, IState> {

  public state: IState = {
    options: [],
    defaultValue: undefined,
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

    const contentTypeIds = field.options.contentTypeIds || [];
    if (field.options.contentTypeId) {
      contentTypeIds.push(field.options.contentTypeId);
    }

    const contentTypes = await Promise.all(
      contentTypeIds.map(async (contentTypeId: string) => {
        const contentType = await stores.ContentTypes.loadById(contentTypeId);
        const items = await stores.ContentEntries.loadByContentType(contentType.id);

        return { contentType, items };
      })
    );

    const state: IState = {
      options: contentTypes.map(({ contentType, items }: any) => ({ // tslint:disable-line no-any
        key: contentType.id,
        value: contentType.id,
        title: contentType.title,
        selectable: false,
        isLeaf: false,
        children: items.map((item: IContentType) => ({
          key: item.entryId,
          value: item.entryId,
          title: item.display,
          isLeaf: true
        }))
      })),
      defaultValue: undefined,
      loading: false
    };

    const { multiple = false } = field.options;

    if (multiple) {
      if (typeof initialValue === 'string') {
        state.defaultValue = [initialValue];
      } else if (Array.isArray(initialValue)) {
        state.defaultValue = [].concat((initialValue || []));
      }
    } else if (initialValue) {
      state.defaultValue = Array.isArray(initialValue) ? initialValue[0] : initialValue;
    }

    this.setState(state);
  }

  public onChange = (value: string | string[]) => {
    this.props.form.setFieldsValue({
      [this.props.path]: value
    });
  }

  public render() {
    const { loading, defaultValue, options } = this.state;
    const { field, path, form, initialValue } = this.props;
    const { getFieldDecorator } = form;

    return (
      <Form.Item label={field.title}>
        {loading === false ? (
          <TreeSelect
            style={{ width: 300 }}
            defaultValue={defaultValue}
            dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
            showSearch={true}
            size="large"
            treeData={options}
            placeholder="Pick document(s)"
            multiple={field.options.multiple || false}
            treeNodeFilterProp="title"
            onChange={this.onChange}
          />
        ) : null}
        {getFieldDecorator(path, {
          initialValue
        })(<input type="hidden" />)}
      </Form.Item>
    );
  }
}
