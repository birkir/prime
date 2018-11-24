import React from 'react';
import { get } from 'lodash';
import { Form, Input, Button, Card, Divider } from 'antd';
import { fields } from './document-form/DocumentForm';

const getRandomId = () => Array.from({ length: 5 })
  .map(() => Math.floor(Math.random() * 10000) + 9999)
  .join('-');

interface IProps {
  field: any;
  form: any;
}

// @todo get this from core via express static

class FieldGroupInput extends React.PureComponent<IProps, any> {

  constructor(props: any) {
    super(props);
    const { form, field } = props;
    const { getFieldValue, getFieldDecorator } = form;

    const value = getFieldValue(field.name);

    this.keysKey =  `${field.name}.keys`;

    if (Array.isArray(value)) {
      this.initialValue = value.map(() => getRandomId());
      value.forEach((value, index) => {
        Object.entries(value || {}).forEach(([vKey, vVal]) => {
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
    if (fieldsField && fieldsField.component) {
      const FieldComponent = fieldsField.component;
      return <FieldComponent
        key={field.id}
        field={field}
        form={this.props.form}
        path={`tags.${index}.${field.name}`}
      />;
    }
  }

  renderGroupItem = (key: any, index: number) => {
    const { field, form } = this.props;

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

export const FieldGroup = {
  component: FieldGroupInput,
}
