import * as React from 'react';
import { Form, Button, Input, notification, Checkbox, Select, Switch, Divider, message } from 'antd';
import { FormComponentProps } from 'antd/lib/form';
import { get, startCase, debounce } from 'lodash';
import { ContentTypes } from '../../../stores/contentTypes';
import { toJS } from 'mobx';
import { client } from '../../../utils/client';
import gql from 'graphql-tag';

interface IProps extends FormComponentProps {
  onCancel(): void;
  onSubmit(data: any): void;
  contentTypeId: string | null;
  contentTypes: any;
  item?: any;
}

const forbiddenNames = [
  'PageInfo',
  'DocumentMeta',
];

const EditContentTypeBase = ({ form, onCancel, onSubmit, contentTypes, contentTypeId, item }: IProps) => {

  const { getFieldDecorator } = form;

  const checkNameAvailability = async () => {
    const { data } = await client.query({
      query: gql`
        query isContentTypeAvailable($name:String, $isSlice:Boolean, $isTemplate:Boolean) {
          isContentTypeAvailable(
            name: $name
            isSlice: $isSlice
            isTemplate: $isTemplate
          )
        }
      `,
      variables: {
        name: form.getFieldValue('name'),
        isSlice: form.getFieldValue('type') === 'slice',
        isTemplate: form.getFieldValue('type') === 'template',
      },
    });

    return data && (data as any).isContentTypeAvailable;
  };

  const onFormSubmit = async (e: React.FormEvent<HTMLElement>) => {
    e.preventDefault();

    form.validateFieldsAndScroll(async (error, values) => {

      if (!error) {
        const isAvailable = (item.name === values.name) || await checkNameAvailability();
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
        const type = data.type;
        delete data.type;
        data.isSlice = (type === 'slice');
        data.isTemplate = (type === 'template');

        try {
          let result = null;
          if (contentTypeId && item) {
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
  }

  const updateApiField = () => {
    form.setFieldsValue({
      name: startCase(form.getFieldValue('title')).replace(/ /g, ''),
    });
  }

  return (
    <>
      <Form layout="vertical" hideRequiredMark onSubmit={onFormSubmit}>
        <Form.Item label="Title">
          {getFieldDecorator('title', {
            rules: [{
              required: true,
              message: 'Required field'
            }],
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
            rules: [{
              required: true,
              message: 'Required field'
            }, {
              pattern: /^[A-Z][A-Za-z0-9]+(?:[A-Za-z0-9]+)*$/,
              message: 'Must be CamelCase',
            }],
          })(
            <Input
              placeholder="e.g. CustomPage"
              autoComplete="off"
              size="large"
            />
          )}
        </Form.Item>

        {contentTypeId ? getFieldDecorator('type')(
          <input type="hidden" />
        ) : (
          <Form.Item label="Type">
            {getFieldDecorator('type')(
              <Select size="large">
                <Select.Option key="contentType">Content Type</Select.Option>
                <Select.Option key="template">Template</Select.Option>
                <Select.Option key="slice">Slice</Select.Option>
              </Select>
            )}
          </Form.Item>
        )}

        {form.getFieldValue('type') === 'contentType' && (
          <>
            <Divider dashed />
            <Form.Item label="Templates">
              {getFieldDecorator('settings.contentTypeIds')(
                <Select
                  mode="multiple"
                  size="large"
                  style={{ width: '100%' }}
                  placeholder="No templates"
                >
                  {[].concat(contentTypes).filter((item: any) => item.isTemplate).map((item: any) => (
                    <Select.Option key={item.id}>{item.title}</Select.Option>
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
          <Button style={{ marginRight: 8 }} onClick={onCancel}>Cancel</Button>
          <Button onClick={onFormSubmit} type="primary" htmlType="submit">Submit</Button>
        </div>
      </Form>
    </>
  );
}

export const EditContentType = Form.create({
  mapPropsToFields(props: any) {
    const type = (() => {
      if (props.item && props.item.isSlice) return 'slice';
      if (props.item && props.item.isTemplate) return 'template';
      return 'contentType';
    })();

    const res: any = {
      type: Form.createFormField({ value: type }),
    };

    if (props.item) {
      const item = toJS(props.item);
      res.title = Form.createFormField({ value: get(item, 'title', '') });
      res.name = Form.createFormField({ value: get(item, 'name', '') });
      res['settings.contentTypeIds'] = Form.createFormField({ value: get(item, 'settings.contentTypeIds', []) });
      res['settings.single'] = Form.createFormField({ value: get(item, 'settings.single', false) });
      res['settings.mutations'] = Form.createFormField({ value: get(item, 'settings.mutations', true) });
    }

    return res;
  }
})(EditContentTypeBase);
