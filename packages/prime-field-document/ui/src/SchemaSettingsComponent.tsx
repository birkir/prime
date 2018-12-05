import { IPrimeFieldProps } from '@primecms/field';
import { Form, Select } from 'antd';
import * as React from 'react';

interface IContentType {
  id: string;
  title: string;
  isSlice?: boolean;
}

export class SchemaSettingsComponent extends React.PureComponent<IPrimeFieldProps> {
  public render() {
    const { form, stores } = this.props;

    return (
      <>
        <Form.Item label="Content Type">
          {form.getFieldDecorator('options.contentTypeId')(
            <Select placeholder="Select Content Type">
              {stores.ContentTypes.list.filter((n: IContentType) => !n.isSlice).map((contentType: IContentType) => (
                <Select.Option value={contentType.id} key={contentType.id}>
                  {contentType.title}
                </Select.Option>
              ))}
            </Select>
          )}
        </Form.Item>
      </>
    );
  }
}
