import React, { useState } from 'react';
import { Form, Button, Input, notification, Checkbox, Select, Switch, Divider } from 'antd';
import { FormComponentProps } from 'antd/lib/form';
import { startCase } from 'lodash';
import { ContentTypes } from '../../../stores/contentTypes';

interface IProps extends FormComponentProps {
  onCancel(): void;
  onSubmit(data: any): void;
}

const CreateFormBase = ({ form, onCancel, onSubmit }: IProps) => {

  const { getFieldDecorator } = form;

  const [type, setType] = useState('contentType');

  const onTypeChange = (option: any) => {
    form.setFieldsValue({
      isSlice: option === 'slice',
      isTemplate: option === 'template',
    });
    setType(option);
  }

  const onFormSubmit = async (e: React.FormEvent<HTMLElement>) => {
    e.preventDefault();

    const data = form.getFieldsValue();

    try {
      const result = await ContentTypes.create(data as any);
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
              pattern: /^[A-Z][A-Za-z]+(?:[A-Za-z]+)*$/,
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

        <Form.Item label="Type">
          <Select value={type} size="large" onChange={onTypeChange}>
            <Select.Option key="contentType">Content Type</Select.Option>
            <Select.Option key="template">Template</Select.Option>
            <Select.Option key="slice">Slice</Select.Option>
          </Select>
        </Form.Item>

        {getFieldDecorator('isTemplate')(<input type="hidden" />)}
        {getFieldDecorator('isSlice')(<input type="hidden" />)}

        {type === 'contentType' && (
          <>
            <Divider dashed />

            <Form.Item label="Templates">
              {getFieldDecorator('settings.templates')(
                <Select
                  mode="multiple"
                  size="large"
                  style={{ width: '100%' }}
                  placeholder="No templates"
                  defaultValue={[]}
                  onChange={() => null}
                >
                  <Select.Option key="opt1">SEO</Select.Option>
                  <Select.Option key="opt2">Open Graph</Select.Option>
                </Select>
              )}
            </Form.Item>
            <Form.Item label="Mutations">
              {getFieldDecorator('settings.mutations')(<Switch />)}
            </Form.Item>
          </>
        )}

        <div
          style={{
            position: 'absolute',
            bottom: 0,
            width: '100%',
            borderTop: '1px solid #e8e8e8',
            padding: '10px 16px',
            textAlign: 'right',
            left: 0,
            background: '#fff',
            borderRadius: '0 0 4px 4px',
          }}
        >
          <Button style={{ marginRight: 8 }} onClick={onCancel}>Cancel</Button>
          <Button onClick={onFormSubmit} type="primary" htmlType="submit">Submit</Button>
        </div>
      </Form>
    </>
  );
}

export const CreateForm = Form.create()(CreateFormBase);
