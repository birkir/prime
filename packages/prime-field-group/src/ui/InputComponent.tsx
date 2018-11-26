import * as React from 'react';
import { Button, Card, Divider } from 'antd';
import { get } from 'lodash';

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

  constructor(props: any) {
    super(props);
    const { form, field, path } = props;
    const { getFieldValue, getFieldDecorator } = form;

    const values = getFieldValue(path || field.name);
    this.values = values;
    this.keysKey =  `${path || field.name}.keys`;

    if (Array.isArray(values)) {
      this.initialValue = values.map(() => getRandomId());
    } else {
      this.initialValue = [];
    }
  }

  values: any;
  keysKey: any;
  initialValue: string[];

  remove = (k: any) => {
    const { form } = this.props;
    const keys = form.getFieldValue(this.keysKey);
    form.setFieldsValue({
      [this.keysKey]: keys.map((key: any) => key === k ? null : key),
    });
  }

  add = () => {
    const { form } = this.props;
    const keys = form.getFieldValue(this.keysKey);
    const nextKeys = keys.concat(getRandomId());
    form.setFieldsValue({
      [this.keysKey]: nextKeys,
    });
  }

  renderField = (field: any, key: string) => {
    const { getFieldValue, getFieldDecorator } = this.props.form;
    const keys = getFieldValue(this.keysKey);
    const index = keys.indexOf(key);
    const path = `${this.props.path || this.props.field.name}.${index}.${field.name}`;
    const initialValue = get(this.values, `${index}.${field.name}`);

    return this.props.renderField({
      ...this.props,
      field,
      path,
      initialValue,
    });
  }

  renderGroupItem = (key: any, index: number) => {
    const { field } = this.props;

    if (!key) return null;

    return (
      <div key={key} style={{ position: 'relative' }}>
        <Button shape="circle-outline" icon="minus" style={{ position: 'absolute', top: -8, right: 0, zIndex: 2 }} onClick={() => this.remove(key)}></Button>
        {field.fields.map((f: any) => this.renderField(f, key))}
        <Divider />
      </div>
    );
  }

  render() {
    const { field, form } = this.props;
    const { getFieldValue, getFieldDecorator } = form;

    getFieldDecorator(this.keysKey, { initialValue: this.initialValue });

    const keys = getFieldValue(this.keysKey);

    return (
      <Card
        title={field.title}
        extra={
          <Button onClick={this.add}>Add Item</Button>
        }
      >
        {keys.map(this.renderGroupItem)}
      </Card>
    );
  };
}
