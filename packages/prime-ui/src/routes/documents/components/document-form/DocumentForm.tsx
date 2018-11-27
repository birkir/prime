import React from 'react';
import { get } from 'lodash';
import { Form, Tabs } from 'antd';
import { FormComponentProps } from 'antd/lib/form';
import { hasParentOfType } from 'mobx-state-tree';

import { SchemaField } from '../../../../stores/models/Schema';
import { client } from '../../../../utils/client';
import { fields } from '../../../../utils/fields';
import stores from '../../../../stores';

export interface IDocumentFormProps extends FormComponentProps {
  entry?: any;
  schema: any;
  onSave(e: React.MouseEvent<any> | React.FormEvent<any>): void;
}

function renderInputField({ field, path, initialValue, form, entry, client, stores }: any) {
  const fieldsField = get(fields, field.type);

  if (fieldsField && fieldsField.InputComponent) {
    return <fieldsField.InputComponent
      key={field.id}
      field={field}
      form={form}
      client={client}
      stores={stores}
      path={path}
      entry={entry}
      renderField={renderInputField}
      initialValue={initialValue}
    />;
  }

  return (
    <div key={field.id}>
      <i>could not locate ui component for this field: {field.name} ({field.type})</i>
    </div>
  );
}

export class BaseDocumentForm extends React.Component<IDocumentFormProps, any> {

  onSubmit = (e: React.FormEvent<HTMLElement>) => {
    e.preventDefault();
    if (typeof this.props.onSave === 'function') {
      this.props.onSave(e);
    }
  }

  renderField = (field: any, index: number) => {
    const { form } = this.props;
    return renderInputField({
      field,
      index,
      form,
      client,
      stores,
      path: field.name,
      entry: this.props.entry,
    });
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
