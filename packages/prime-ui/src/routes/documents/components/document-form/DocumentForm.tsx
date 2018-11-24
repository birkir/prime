import React from 'react';
import { get } from 'lodash';
import { Form, Tabs } from 'antd';
import { FormComponentProps } from 'antd/lib/form';
import { FieldString } from '../FieldString';
import { FieldGroup } from '../FieldGroup';
import { FieldDocument } from '../FieldDocument';
import { hasParentOfType } from 'mobx-state-tree';
import { SchemaField } from '../../../../stores/models/Schema';

export interface IDocumentFormProps extends FormComponentProps {
  entry?: any;
  schema: any;
  onSave(e: React.MouseEvent<any> | React.FormEvent<any>): void;
}

export const fields = {
  string: FieldString,
  group: FieldGroup,
  document: FieldDocument,
}

export class BaseDocumentForm extends React.Component<IDocumentFormProps, any> {

  onSubmit = (e: React.FormEvent<HTMLElement>) => {
    e.preventDefault();
    if (typeof this.props.onSave === 'function') {
      this.props.onSave(e);
    }
  }

  renderField = (field: any) => {
    const fieldsField = get(fields, field.type);
    if (fieldsField && fieldsField.component) {
      const FieldComponent = fieldsField.component;
      return <FieldComponent
        key={field.id}
        field={field}
        form={this.props.form}
      />;
    }

    return (<div key={field.id}><i>could not locate ui component for this field: {field.name} ({field.type})</i></div>);
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
