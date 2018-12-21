import { IPrimeFieldProps } from '@primecms/field';
import { Button, Form, Input, Switch, Table } from 'antd';
import { get } from 'lodash';
import * as React from 'react';

type IProps = IPrimeFieldProps & {
  options: {
    items: string[][];
    enum: boolean;
    multiple: boolean;
  };
};

export class SchemaSettingsComponent extends React.PureComponent<IProps> {

  public state = {
    dataSource: get(this.props, 'options.items', [])
      .filter((item: any) => !!item && item.key !== '')
      .map((item: any, index: number) => ({ // tslint:disable-line no-any
        id: index,
        ...item
      }))
  };

  public onAddClick = () => {
    const { dataSource } = this.state;
    const id = Math.max(...[...dataSource.map((n: any) => n.id), 0]) + 1; // tslint:disable-line no-any
    this.setState({
      dataSource: [...dataSource, { id, key: '', value: '' }]
    });
  }

  public onRemoveClick = (e: React.MouseEvent<HTMLElement>) => {
    const id = Number(e.currentTarget.dataset.id);
    const { dataSource } = this.state;
    const index = dataSource.findIndex((n: any) => n.id === id); // tslint:disable-line no-any
    dataSource.splice(index, 1);
    this.setState({
      dataSource
    });
    this.forceUpdate();
  }

  public ensureUnique = (id: number) => (rule: any, value: any, callback: (input?: string) => void) => { // tslint:disable-line no-any
    const values = this.props.form.getFieldsValue() as any;
    const found = values.options.items.find((item: any, index: number) => {
      return item.key === value && index !== id;
    });

    callback(found ? 'must be unique' : undefined);
  }

  public render() {
    const { form, options } = this.props;

    return (
      <>
        <Form.Item>
          {form.getFieldDecorator('options.multiple', {
            valuePropName: 'checked',
            initialValue: options.multiple
          })(
            <Switch style={{ marginRight: 8 }} />
          )}
          <strong>Multiple</strong>
        </Form.Item>
        <Form.Item>
          {form.getFieldDecorator('options.enum', {
            valuePropName: 'checked',
            initialValue: options.enum
          })(
            <Switch style={{ marginRight: 8 }} />
          )}
          <strong>Enums</strong><i> (output enum keys)</i>
        </Form.Item>
        <Form.Item label="Options">
          <Table
            style={{ marginBottom: 8 }}
            className="prime__settings__table"
            size="small"
            pagination={false}
            // showHeader={false}
            columns={[{
              title: 'Key',
              dataIndex: 'key',
              render: (text: string, record: any) => { // tslint:disable-line no-any
                return (
                  <Form.Item>
                    {form.getFieldDecorator(`options.items.${record.id}.key`, {
                      initialValue: text,
                      rules: [{
                        pattern: /^[_a-zA-Z][_a-zA-Z0-9]*$/,
                        message: 'must be alphanumeric'
                      }, {
                        validator: this.ensureUnique(record.id)
                      }, {
                        required: true,
                        message: 'required field'
                      }]
                    })(
                      <Input  />
                    )}
                  </Form.Item>
                );
              }
            }, {
              title: 'Value',
              dataIndex: 'value',
              render(text: string, record: any) { // tslint:disable-line no-any
                return (
                  <Form.Item>
                    {form.getFieldDecorator(`options.items.${record.id}.value`, {
                      initialValue: text,
                      rules: [{
                        required: true,
                        message: 'required field'
                      }]
                    })(
                      <Input  />
                    )}
                  </Form.Item>
                );
              }
            }, {
              title: '',
              render: (text: string, record: any) => { // tslint:disable-line no-any
                return <a role="button" data-id={record.id} onClick={this.onRemoveClick}>X</a>;
              }
            }]}
            dataSource={this.state.dataSource}
          />
          <Button size="small" onClick={this.onAddClick}>Add</Button>
        </Form.Item>
      </>
    );
  }
}
