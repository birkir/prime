import { IPrimeFieldProps } from '@primecms/field';
import { Button, Form, Input, Switch, Table } from 'antd';
import { get } from 'lodash';
import * as React from 'react';

type IProps = IPrimeFieldProps & {
  options: {
    items: string[][];
    required: boolean;
    enum: boolean;
    multiple: boolean;
  };
};

export class SchemaSettingsComponent extends React.PureComponent<IProps> {
  public state = {
    dataSource: get(this.props, 'options.items', [])
      .filter((item: any) => !!item && item.key !== '')
      .map((item: any, index: number) => ({
        id: index,
        ...item,
      })),
  };

  public componentWillReceiveProps(nextProps: IProps) {
    if (this.props.field.id !== nextProps.field.id) {
      this.setState({
        dataSource: get(nextProps, 'options.items', [])
          .filter((item: any) => !!item && item.key !== '')
          .map((item: any, index: number) => ({
            id: index,
            ...item,
          })),
      });
    }
  }

  public onAddClick = () => {
    const { dataSource } = this.state;
    const id = Math.max(...[...dataSource.map((n: any) => n.id), 0]) + 1;
    this.setState({
      dataSource: [...dataSource, { id, key: '', value: '' }],
    });
  };

  public onRemoveClick = (e: React.MouseEvent<HTMLElement>) => {
    const id = Number(e.currentTarget.dataset.id);
    const { dataSource } = this.state;
    const index = dataSource.findIndex((n: any) => n.id === id);
    dataSource.splice(index, 1);
    this.setState({
      dataSource,
    });
    this.forceUpdate();
  };

  public ensureUnique = (id: number) => (rule: any, value: any, callback: (input?: string) => void) => {
    const values = this.props.form.getFieldsValue() as any;
    const found = values.options.items.find((item: any, index: number) => {
      return item && item.key === value && index !== id;
    });

    callback(found ? 'must be unique' : undefined);
  };

  public render() {
    const { form, options } = this.props;

    return (
      <>
        <Form.Item label="Options" style={{ marginBottom: -8 }} />
        <Form.Item style={{ marginBottom: 0 }}>
          {form.getFieldDecorator('options.required', {
            valuePropName: 'checked',
            initialValue: options.required,
          })(<Switch />)}
          <label htmlFor="options.required" style={{ marginLeft: 8 }}>
            Required
          </label>
        </Form.Item>
        <Form.Item style={{ marginBottom: 0 }}>
          {form.getFieldDecorator('options.multiple', {
            valuePropName: 'checked',
            initialValue: options.multiple,
          })(<Switch />)}
          <label htmlFor="options.multiple" style={{ marginLeft: 8 }}>
            Multiple selection
          </label>
        </Form.Item>
        <Form.Item style={{ marginBottom: 0 }}>
          {form.getFieldDecorator('options.enum', {
            valuePropName: 'checked',
            initialValue: options.enum,
          })(<Switch />)}
          <label htmlFor="options.enum" style={{ marginLeft: 8 }}>
            Enum
          </label>
        </Form.Item>
        <Form.Item label="Items">
          <Table
            style={{ marginBottom: 8 }}
            className="prime__settings__table"
            size="small"
            pagination={false}
            locale={{ emptyText: 'No items' }}
            columns={[
              {
                title: 'Key',
                dataIndex: 'key',
                render: (text: string, record: any) => {
                  return (
                    <Form.Item>
                      {form.getFieldDecorator(`options.items.${record.id}.key`, {
                        initialValue: text,
                        rules: [
                          {
                            pattern: /^[_a-zA-Z][_a-zA-Z0-9]*$/,
                            message: 'must be alphanumeric',
                          },
                          {
                            validator: this.ensureUnique(record.id),
                          },
                          {
                            required: true,
                            message: 'required field',
                          },
                        ],
                      })(<Input />)}
                    </Form.Item>
                  );
                },
              },
              {
                title: 'Value',
                dataIndex: 'value',
                render(text: string, record: any) {
                  return (
                    <Form.Item>
                      {form.getFieldDecorator(`options.items.${record.id}.value`, {
                        initialValue: text,
                        rules: [
                          {
                            required: true,
                            message: 'required field',
                          },
                        ],
                      })(<Input />)}
                    </Form.Item>
                  );
                },
              },
              {
                title: '',
                render: (text: string, record: any) => {
                  return (
                    <a role="button" data-id={record.id} onClick={this.onRemoveClick}>
                      X
                    </a>
                  );
                },
              },
            ]}
            dataSource={this.state.dataSource}
          />
          <Button size="small" onClick={this.onAddClick}>
            Add item
          </Button>
        </Form.Item>
      </>
    );
  }
}
