// tslint:disable insecure-random no-any
import { Button, Card, Divider, Form, Icon } from 'antd';
import { get } from 'lodash';
import * as React from 'react';

const getRandomId = () => Array.from({ length: 5 })
  .map(() => Math.floor(Math.random() * 10000) + 9999)
  .join('-');

interface IProps {
  field: any;
  form: any;
  renderField: any;
  path: any;
}

export class InputComponent extends React.PureComponent<IProps, any> {

  public values: any;
  public keysKey: any;
  public initialValue: string[];

  constructor(props: any) {
    super(props);
    const { path, entry } = props;
    const values = get(entry.data, path, []);

    this.values = values;
    this.keysKey =  `${path}.keys`;

    if (Array.isArray(values)) {
      this.initialValue = values.map(getRandomId);
    } else {
      this.initialValue = [];
    }
  }

  public onRemoveClick = (e: React.MouseEvent<HTMLElement>) => {
    const key = String(e.currentTarget.dataset.key);
    this.remove(key);
  }

  public remove = (k: any) => {
    const { form } = this.props;
    const keys = form.getFieldValue(this.keysKey);
    form.setFieldsValue({
      [this.keysKey]: keys.map((key: any) => key === k ? null : key)
    });
  }

  public add = () => {
    const { form } = this.props;
    const keys = form.getFieldValue(this.keysKey);
    const nextKeys = keys.concat(getRandomId());
    form.setFieldsValue({
      [this.keysKey]: nextKeys
    });
  }

  public renderField = (field: any, key: string) => {
    const { getFieldValue } = this.props.form;
    const keys = getFieldValue(this.keysKey);
    const index = keys.indexOf(key);
    const path = `${this.props.path}.${index}.${field.name}`;
    const initialValue = get(this.values, `${index}.${field.name}`);

    return this.props.renderField({
      ...this.props,
      field,
      path,
      initialValue
    });
  }

  public renderGroupItem = (key: any, index: number) => {
    const { field } = this.props;

    if (!key) { return null; }

    return (
      <Card key={key} style={{ position: 'relative', marginBottom: 16 }} bodyStyle={{ padding: 16, paddingTop: 8, paddingBottom: 0 }}>
        <Button
          data-key={key}
          shape="circle-outline"
          icon="minus"
          style={{ position: 'absolute', top: -16, right: -16, zIndex: 2 }}
          onClick={this.onRemoveClick}
        />
        {field.fields.map((f: any) => this.renderField(f, key))}
      </Card>
    );
  }

  public render() {
    const { field, form } = this.props;
    const { getFieldValue, getFieldDecorator } = form;

    getFieldDecorator(this.keysKey, { initialValue: this.initialValue });

    const keys = getFieldValue(this.keysKey);

    return (
      <>
        <Form.Item label={field.title}>
          {keys.map(this.renderGroupItem)}
          <Button size="large" block={true} onClick={this.add}>
            <Icon type="plus" />
            Add Item
          </Button>
        </Form.Item>
      </>
    );
  }
}
