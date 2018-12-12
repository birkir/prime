import { IPrimeFieldProps } from '@primecms/field';
import { Checkbox, Form, Select } from 'antd';
import * as React from 'react';

interface IContentType {
  id: string;
  title: string;
  isSlice?: boolean;
}

export class SchemaSettingsComponent extends React.PureComponent<IPrimeFieldProps> {
  public render() {
    const { form, stores, field } = this.props;
    const { options } = field;

    return (
      <>
        <Form.Item label="Slices">
          {form.getFieldDecorator('options.contentTypeIds')(
            <Select placeholder="Select Slices" mode="multiple">
              {stores.ContentTypes.list.filter((n: IContentType) => n.isSlice).map((contentType: IContentType) => (
                <Select.Option value={contentType.id} key={contentType.id}>
                  {contentType.title}
                </Select.Option>
              ))}
            </Select>
          )}
        </Form.Item>
        <Form.Item>
          {form.getFieldDecorator('options.multiple', {
            valuePropName: 'checked',
            initialValue: options.multiple
          })(
            <Checkbox>Multiple</Checkbox>
          )}
        </Form.Item>
      </>
    );
  }
}
