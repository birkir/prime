import React from 'react';
import { get } from 'lodash';
import { Form, Tabs, Dropdown, Button, Menu, Card } from 'antd';
import { FormComponentProps } from 'antd/lib/form';
import { hasParentOfType } from 'mobx-state-tree';

import { SchemaField } from '../../../../stores/models/Schema';
import { client } from '../../../../utils/client';
import { fields } from '../../../../utils/fields';
import stores from '../../../../stores';
import { ContentTypes } from '../../../../stores/contentTypes';

export interface IDocumentFormProps extends FormComponentProps {
  entry?: any;
  schema: any;
  onSave(e: React.MouseEvent<any> | React.FormEvent<any>): void;
}

const sampleSliceData = [{
  __inputname: 'adasf-asdf-asdf',
  myFieldName: 'stuff',
}, {
  __inputname: 'fefefef',
  otherField: 'foobar',
}];

class SliceField extends React.Component<any> {

  state = {
    contentTypes: [],
    slices: [],
  }

  values: any = [];

  componentDidMount() {
    this.load();
  }

  async load() {
    const ids = get(this.props.field.options, 'contentTypeIds', []);
    this.values = this.props.form.getFieldValue(this.props.field.name) || [];

    this.setState({
      contentTypes: ContentTypes.list.filter(n => ids.indexOf(n.id) >= 0),
      slices: this.values.map((n: any) => ContentTypes.items.get(n.__inputname)),
    });
  }

  remove = (index: number) => {
    const slices: any = this.state.slices.slice(0);
    slices[index] = null;
    console.log(slices);
    this.setState({ slices });
  }

  onMenuClick = async (e: any) => {
    const item = ContentTypes.items.get(e.key)
    const slices: any = this.state.slices.slice(0);
    slices.push(item);

    this.setState({
      slices,
    });
  }

  renderField = (field: any, index: number) => {
    const { form } = this.props;
    const fieldsField = get(fields, field.type);
    const initialValue = get(this.values, `${index}.${field.name}`, '');

    form.getFieldDecorator(`${this.props.field.name}.${index}.${field.name}`, {
      initialValue,
    });

    if (fieldsField && fieldsField.InputComponent) {
      return <fieldsField.InputComponent
        key={field.id}
        field={field}
        form={form}
        client={client}
        stores={stores}
        path={`${this.props.field.name}.${index}.${field.name}`}
      />;
    }

    return (
      <div key={field.id}>
        <i>could not locate ui component for this field: {field.name} ({field.type})</i>
      </div>
    );
  }

  render() {
    const { field, form } = this.props;
    const menu = (
      <Menu onClick={this.onMenuClick}>
        {this.state.contentTypes.map((item: any) => (
          <Menu.Item key={item.id}>{item.title}</Menu.Item>
        ))}
      </Menu>
    );

    return (
      <>
        <div>{field.title} :</div>
        {this.state.slices.map((slice: any, index) => {
          if (!slice || !slice.id) return null;
          return (
            <Card
              key={`${slice.id}_${index}`}
              title={slice.title}
              style={{ marginBottom: 16 }}
              extra={
                <Button onClick={() => this.remove(index)}>Remove</Button>
              }
            >
              {slice.schema.fields.map((f: any) => this.renderField(f, index))}
              {form.getFieldDecorator(`${field.name}.${index}.__inputname`, {
                initialValue: slice.id,
              })(
                <input type="hidden" />
              )}
            </Card>
          );
        })}
        <Dropdown overlay={menu} trigger={['click']}>
          <Button>Add Slice</Button>
        </Dropdown>
      </>
    );
  }
}

export class BaseDocumentForm extends React.Component<IDocumentFormProps, any> {

  onSubmit = (e: React.FormEvent<HTMLElement>) => {
    e.preventDefault();
    if (typeof this.props.onSave === 'function') {
      this.props.onSave(e);
    }
  }

  renderField = (field: any) => {
    const { form } = this.props;
    const fieldsField = get(fields, field.type);

    if (field.type === 'slice') {
      return <SliceField
        key={field.id}
        field={field}
        form={form}
        client={client}
        stores={stores}
      />
    }

    if (fieldsField && fieldsField.InputComponent) {
      return <fieldsField.InputComponent
        key={field.id}
        field={field}
        form={form}
        client={client}
        stores={stores}
      />;
    }

    return (
      <div key={field.id}>
        <i>could not locate ui component for this field: {field.name} ({field.type})</i>
      </div>
    );
  }

  renderGroup = (group: any) => (
    <Tabs.TabPane
      key={group.title}
      tab={group.title}
      forceRender
    >
      {group.fields.map(this.renderField)}
    </Tabs.TabPane>
  );

  render() {
    const { groups } = this.props.schema;
    return (
      <Form onSubmit={this.onSubmit}>
        <Tabs
          size="large"
          animated={false}
        >
          {groups.map(this.renderGroup)}
        </Tabs>
        <button type="submit" hidden />
      </Form>
    );
  }
}

export const DocumentForm = Form.create({
  mapPropsToFields(props: any) {
    return props.schema.fields.reduce((acc: any, field: any) => {
      const paths = [field.name];
      if (field) {
        if (hasParentOfType(field, SchemaField)) {
          // Don't process child fields
          return acc;
        }

        const key = paths.join('.');
        const value = get(props, `entry.data.${key}`, '');

        acc[key] = Form.createFormField({ value });
      }
      return acc;
    }, {});
  },
})(BaseDocumentForm);
