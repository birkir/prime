import React from 'react';
import { Prompt } from 'react-router';
import { get } from 'lodash';
import { Form, Tabs, Button } from 'antd';
import { FormComponentProps } from 'antd/lib/form';
import { hasParentOfType } from 'mobx-state-tree';

import { SchemaField } from '../../../../stores/models/Schema';
import { client } from '../../../../utils/client';
import { fields } from '../../../../utils/fields';
import stores from '../../../../stores';

export interface IDocumentFormProps extends FormComponentProps {
  entry?: any;
  schema: any;
  promptEnabled: boolean;
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
      initialValue: get(this.props, `entry.data.${field.name}`),
    });
  }

  renderGroup = (group: any, index: number, groups: any[]) => (
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
      <div className="prime-document">
        <Prompt
          when={this.props.promptEnabled && this.props.form.isFieldsTouched()}
          message="You have unsaved changes. Are you sure you want to leave?"
        />
        <Form>
          <Tabs
            type="card"
            animated={false}
          >
            {groups.map(this.renderGroup)}
          </Tabs>
          <button type="submit" hidden />
        </Form>
      </div>
    );
  }
}

export const DocumentForm = Form.create()(BaseDocumentForm);
