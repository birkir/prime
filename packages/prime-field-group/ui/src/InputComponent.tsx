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

  public repeated: boolean;
  public values: any;
  public keysKey: any;
  public initialValue: string[];

  constructor(props: any) {
    super(props);
    const { path, entry, initialValue } = props;
    const values = initialValue;
    // get(entry, `data.${path}`, []);

    this.repeated = get(props.field, 'options.repeated', false) === true;
    this.values = values;
    this.keysKey =  `${path}.keys`;

    if (Array.isArray(values)) {
      this.initialValue = values.map(getRandomId);
    } else {
      this.initialValue = this.repeated ? [] : [{} as any];
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
    const index = this.repeated ? `${keys.indexOf(key)}.` : '';
    const path = `${this.props.path}.${index}${field.name}`;
    const initialValue = get(this.values, `${index}${field.name}`);

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
      <Card
        key={key}
        className="prime-group-item"
      >
        {this.repeated && (
          <div className="prime-slice-item-actions">
            {/* <Icon
              className="prime-slice-item-button disabled"
              type="up"
              data-index={index}
            />
            <Icon
              className="prime-slice-item-button disabled"
              type="down"
              data-index={index}
            /> */}
            <Icon
              className="prime-slice-item-button"
              type="minus"
              data-key={key}
              onClick={this.onRemoveClick}
            />
          </div>
        )}
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
        <Form.Item label={field.title} className="prime-group">
          {keys.map(this.renderGroupItem)}
          {this.repeated && (
            <Button size="large" block={true} onClick={this.add} className="prime-slice-add">
              <Icon type="plus" />
              Add Item
            </Button>
          )}
        </Form.Item>
      </>
    );
  }
}
