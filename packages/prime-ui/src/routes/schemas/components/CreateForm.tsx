import React from 'react';
import { Form, Button, Input, notification, Checkbox } from 'antd';
import { FormComponentProps } from 'antd/lib/form';
import { startCase } from 'lodash';
import { ContentTypes } from '../../../stores/contentTypes';

interface IProps extends FormComponentProps {
  onCancel(): void;
  onSubmit(data: any): void;
}

const CreateFormBase = ({ form, onCancel, onSubmit }: IProps) => {

  const { getFieldDecorator } = form;

  const onFormSubmit = async (e: React.FormEvent<HTMLElement>) => {
    e.preventDefault();

    const data = form.getFieldsValue();

    try {
      const result = await ContentTypes.create(data as any);
      form.resetFields();

      return onSubmit(result);
    } catch (err) {
      notification.error({
        message: 'Could not create content type',
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
            rules: [{ required: true, message: 'please enter title' }],
          })(<Input autoFocus onKeyUp={updateApiField} placeholder="Please enter title" />)}
        </Form.Item>
        <Form.Item label="API">
          {getFieldDecorator('name', {
            rules: [{ message: 'please enter api id' }],
          })(<Input placeholder="Please enter api id" />)}
        </Form.Item>
        <Form.Item label="Slice">
          {getFieldDecorator('isSlice')(<Checkbox />)}
        </Form.Item>
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
