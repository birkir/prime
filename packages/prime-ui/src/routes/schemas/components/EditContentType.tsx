import { Button, Divider, Form, Input, notification, Select, Switch } from 'antd';
import { FormComponentProps } from 'antd/lib/form';
import gql from 'graphql-tag';
import { get, startCase } from 'lodash';
import { toJS } from 'mobx';
import React from 'react';
import { ContentTypes } from '../../../stores/contentTypes';
import { client } from '../../../utils/client';

interface IProps extends FormComponentProps {
  schemaId: string | null;
  schemas: any;
  item?: any;
  onCancel(): void;
  onSubmit(data: any): void;
}

const forbiddenNames = ['PageInfo', 'DocumentMeta'];

const EditContentTypeBase = ({ form, onCancel, onSubmit, schemas, schemaId, item }: IProps) => {
  const { getFieldDecorator } = form;

  const checkNameAvailability = async () => {
    const { data } = await client.query({
      query: gql`
        query schemaNameAvailable($name: String!, $variant: SchemaVariant) {
          schemaNameAvailable(name: $name, variant: $variant)
        }
      `,
      variables: {
        name: form.getFieldValue('name'),
        variant: form.getFieldValue('variant'),
      },
    });

    return data && (data as any).schemaNameAvailable;
  };

  const onFormSubmit = async (e: React.FormEvent<HTMLElement>) => {
    e.preventDefault();

    form.validateFieldsAndScroll(async (error, values) => {
      if (!error) {
        const isAvailable = item.name === values.name || (await checkNameAvailability());
        if (!isAvailable) {
          form.setFields({
            name: {
              value: values.name,
              errors: [new Error('This name is already taken')],
            },
          });
          return;
        }

        if (forbiddenNames.indexOf(values.name) >= 0) {
          form.setFields({
            name: {
              value: values.name,
              errors: [new Error('Forbidden name')],
            },
          });
          return;
        }

        const data: any = { ...values };

        try {
          let result = null;
          if (schemaId && item) {
            await item.update(data);
          } else {
            result = await ContentTypes.create(data as any);
          }

          form.resetFields();

          return onSubmit(result);
        } catch (err) {
          notification.error({
            message: 'Could not create Schema',
            description: err.message.replace(/^Error: /, ''),
            duration: 0,
            placement: 'bottomRight',
          });
        }
      }
    });
    return null;
  };

  const updateApiField = () => {
    form.setFieldsValue({
      name: startCase(form.getFieldValue('title')).replace(/ /g, ''),
    });
  };

  return (
    <>
      <Form layout="vertical" hideRequiredMark onSubmit={onFormSubmit}>
        <Form.Item label="Title">
          {getFieldDecorator('title', {
            rules: [
              {
                required: true,
                message: 'Required field',
              },
            ],
          })(
            <Input
              autoFocus
              autoComplete="off"
              size="large"
              onKeyUp={updateApiField}
              placeholder="e.g. Custom page"
            />
          )}
        </Form.Item>

        <Form.Item label="API Name">
          {getFieldDecorator('name', {
            rules: [
              {
                required: true,
                message: 'Required field',
              },
              {
                pattern: /^[A-Z][A-Za-z0-9]+(?:[A-Za-z0-9]+)*$/,
                message: 'Must be CamelCase',
              },
            ],
          })(<Input placeholder="e.g. CustomPage" autoComplete="off" size="large" />)}
        </Form.Item>

        {schemaId ? (
          getFieldDecorator('variant')(<input type="hidden" />)
        ) : (
          <Form.Item label="Variant">
            {getFieldDecorator('variant')(
              <Select size="large">
                <Select.Option key="Default">Content Type</Select.Option>
                <Select.Option key="Template">Template</Select.Option>
                <Select.Option key="Slice">Slice</Select.Option>
              </Select>
            )}
          </Form.Item>
        )}

        {form.getFieldValue('variant') === 'Default' && (
          <>
            <Divider dashed />
            <Form.Item label="Templates">
              {getFieldDecorator('settings.schemaIds')(
                <Select
                  mode="multiple"
                  size="large"
                  style={{ width: '100%' }}
                  placeholder="No templates"
                >
                  {[]
                    .concat(schemas)
                    .filter((n: any) => n.variant === 'Template')
                    .map((n: any) => (
                      <Select.Option key={n.id}>{n.title}</Select.Option>
                    ))}
                </Select>
              )}
            </Form.Item>
            <Form.Item label="Single">
              {getFieldDecorator('settings.single', {
                initialValue: false,
                valuePropName: 'checked',
              })(<Switch />)}
            </Form.Item>
            <Form.Item label="Mutations">
              {getFieldDecorator('settings.mutations', {
                initialValue: true,
                valuePropName: 'checked',
              })(<Switch />)}
            </Form.Item>
          </>
        )}

        <div className="prime__drawer__bottom">
          <Button style={{ marginRight: 8 }} onClick={onCancel}>
            Cancel
          </Button>
          <Button onClick={onFormSubmit} type="primary" htmlType="submit">
            Submit
          </Button>
        </div>
      </Form>
    </>
  );
};

export const EditContentType = Form.create({
  mapPropsToFields(props: any) {
    const res: any = {};

    if (props.item) {
      const item = toJS(props.item);
      res.title = Form.createFormField({ value: get(item, 'title', '') });
      res.name = Form.createFormField({ value: get(item, 'name', '') });
      res.variant = Form.createFormField({ value: get(item, 'variant', 'Default') });
      res['settings.schemaIds'] = Form.createFormField({
        value: get(item, 'settings.schemaIds', []),
      });
      res['settings.single'] = Form.createFormField({ value: get(item, 'settings.single', false) });
      res['settings.mutations'] = Form.createFormField({
        value: get(item, 'settings.mutations', true),
      });
    }

    return res;
  },
})(EditContentTypeBase);
