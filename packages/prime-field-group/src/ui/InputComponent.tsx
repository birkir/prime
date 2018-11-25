import * as React from 'react';
import { get } from 'lodash';
import { Button, Card, Divider } from 'antd';

const fields = (window as any).prime.fields;

const getRandomId = () => Array.from({ length: 5 })
  .map(() => Math.floor(Math.random() * 10000) + 9999)
  .join('-');

interface IProps {
  field: any;
  form: any;
}

export class InputComponent extends React.PureComponent<IProps, any> {

  constructor(props: any) {
    super(props);
    const { form, field } = props;
    const { getFieldValue, getFieldDecorator } = form;

    const value = getFieldValue(field.name);

    this.keysKey =  `${field.name}.keys`;

    if (Array.isArray(value)) {
      this.initialValue = value.map(() => getRandomId());
      value.forEach((value, index) => {
        (Object as any).entries(value || {}).forEach(([vKey, vVal]) => {
          getFieldDecorator(`${field.name}.${index}.${vKey}`, { initialValue: vVal });
        });
      });
    } else {
      this.initialValue = [];
    }
  }

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
    const { getFieldValue } = this.props.form;
    const keys = getFieldValue(this.keysKey);
    const index = keys.indexOf(key);

    const fieldsField = get(fields, field.type);
    if (fieldsField && fieldsField.InputComponent) {
      return <fieldsField.InputComponent
        key={field.id}
        field={field}
        form={this.props.form}
        path={`tags.${index}.${field.name}`}
      />;
    }

    return (
      <div key={field.id}>
        <i>could not locate ui component for this field: {field.name} ({field.type})</i>
      </div>
    );
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
