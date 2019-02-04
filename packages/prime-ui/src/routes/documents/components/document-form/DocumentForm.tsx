import { Form, Tabs } from 'antd';
import { FormComponentProps } from 'antd/lib/form';
import { get } from 'lodash';
import React from 'react';
import { Prompt } from 'react-router';
import stores from '../../../../stores';
import { client } from '../../../../utils/client';
import { fields } from '../../../../utils/fields';

export interface IDocumentFormProps extends FormComponentProps {
  entry?: any;
  schema: any;
  promptEnabled: boolean;
  onSave(e: React.MouseEvent<any> | React.FormEvent<any>): void;
}

function renderInputField({ field, path, initialValue, form, entry }: any) {
  const fieldsField = get(fields, field.type);

  if (fieldsField && fieldsField.InputComponent) {
    return (
      <fieldsField.InputComponent
        key={field.id}
        field={field}
        form={form}
        client={client}
        stores={stores}
        path={path}
        entry={entry}
        renderField={renderInputField}
        initialValue={initialValue}
      />
    );
  }

  return (
    <div key={field.id}>
      <i>
        could not locate ui component for this field: {field.name} ({field.type})
      </i>
    </div>
  );
}

export class BaseDocumentForm extends React.Component<IDocumentFormProps, any> {
  public state = {
    activeTab: get(this.props, 'schema.groups.0.title', 'Main'),
  };

  public renderField = (field: any, index: number) => {
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
  };

  public renderGroup = (group: any, index: number, groups: any[]) => (
    <Tabs.TabPane key={group.title} tab={group.title} forceRender>
      {group.fields.map(this.renderField)}
    </Tabs.TabPane>
  );

  public render() {
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
            activeKey={this.state.activeTab}
            onChange={(activeTab: string) => {
              this.setState({ activeTab });
            }}
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
