import { IPrimeFieldProps } from '@primecms/field';
import { Button, Form, Input, Select, Switch, Tooltip } from 'antd';
import { get } from 'lodash'; // tslint:disable-line
import * as React from 'react';

type IProps = IPrimeFieldProps & {
  options: {
    type: 'singleline' | 'multiline' | 'markdown';
  };
};

const markdownFeatures = [{
  id: 'headings',
  icon: 'font-size',
  title: 'Headings'
}, {
  id: 'bold',
  title: 'Bold'
}, {
  id: 'italic',
  title: 'Italic'
}, {
  id: 'code',
  title: 'Code block'
}, {
  id: 'blockquote',
  icon: 'quote',
  title: 'Block quote'
}, {
  id: 'list-ul',
  icon: 'list',
  title: 'Bullet list'
}, {
  id: 'list-ol',
  icon: 'list-numbered',
  title: 'Ordered list'
}, {
  id: 'link',
  title: 'Hyperlink'
}, {
  id: 'emoji',
  title: 'Emoji'
}];

const defaultFeatures = ['headings', 'bold', 'italic', 'code', 'blockquote', 'list-ul', 'list-ol', 'link', 'emoji'];

export class SchemaSettingsComponent extends React.PureComponent<IProps> {

  public onClickMarkdownFeature = (e: React.MouseEvent<HTMLElement>) => {
    const { form } = this.props;
    const id = e.currentTarget.dataset.id;
    if (id && typeof id === 'string') {
      const values: string[] = [].concat(form.getFieldValue('options.md') || []).slice(0);
      const index = values.indexOf(id);
      if (index >= 0) {
        values.splice(index, 1);
      } else {
        values.push(id);
      }
      form.setFieldsValue({
        'options.md': values
      });
    }
  }

  // tslint:disable-next-line max-func-body-length
  public render() {
    const { form, options = {} } = this.props;
    const type = form.getFieldValue('options.type');
    const isSingleline = type === 'singleline' || !type || type === '';
    const isMultiline = type === 'multiline';
    const isMarkdown = type === 'markdown';
    const features: string[] = [].concat(form.getFieldValue('options.md') || defaultFeatures);

    return (
      <>
        <Form.Item label="Type" style={{ marginBottom: 8 }}>
          {form.getFieldDecorator('options.type', {
            initialValue: get(options, 'type', 'singleline')
          })(
            <Select>
              <Select.Option key="singleline">Singleline</Select.Option>
              <Select.Option key="multiline">Multiline</Select.Option>
              <Select.Option key="markdown">Markdown</Select.Option>
            </Select>
          )}
        </Form.Item>

        {isSingleline && (
          <Form.Item label="Appearance" style={{ marginBottom: 8 }}>
            {form.getFieldDecorator('options.appearance', {
              initialValue: get(options, 'appearance', 'default')
            })(
              <Select>
                <Select.Option key="default">Default</Select.Option>
                <Select.Option key="pre">Preformatted</Select.Option>
                <Select.Option key="heading1">Heading 1</Select.Option>
                <Select.Option key="heading2">Heading 2</Select.Option>
                <Select.Option key="heading3">Heading 3</Select.Option>
                <Select.Option key="heading4">Heading 4</Select.Option>
                <Select.Option key="heading5">Heading 5</Select.Option>
              </Select>
            )}
          </Form.Item>
        )}

        {isMultiline && (
          <Form.Item label="Max lines" style={{ marginBottom: 8 }}>
            {form.getFieldDecorator('options.maxLines', {
              initialValue: get(options, 'rules.maxLines', '')
            })(
              <Input type="number" />
            )}
          </Form.Item>
        )}

        {isMarkdown && (
          <Form.Item label="Rich Text features" style={{ marginBottom: 8 }} className="bf-container">
            {markdownFeatures.map(({ id, icon, title }: any) => ( // tslint:disable-line
              <Tooltip title={title}>
                <Button
                  key={id}
                  data-id={id}
                  onClick={this.onClickMarkdownFeature}
                  type={features.indexOf(id) >= 0 ? 'primary' : undefined}
                  style={{ paddingTop: 2, paddingLeft: 8, paddingRight: 8, marginRight: 8, marginBottom: 8 }}
                >
                  <i className={`bfi-${icon || id}`} />
                </Button>
              </Tooltip>
            ))}

            {form.getFieldDecorator('options.md', {
              initialValue: get(options, 'md', defaultFeatures)
            })(
              <input type="hidden" />
            )}
          </Form.Item>
        )}

        <Form.Item label="Options" style={{ marginBottom: -8 }} />
        <Form.Item style={{ margin: 0 }}>
          {form.getFieldDecorator('options.rules.required', {
            valuePropName: 'checked',
            initialValue: get(options, 'rules.required', false)
          })(
            <Switch />
          )}
          <label htmlFor="options.rules.required" style={{ marginLeft: 8 }}>Required</label>
        </Form.Item>

          {isSingleline && (<>
            <Form.Item style={{ margin: 0 }}>
              {form.getFieldDecorator('options.rules.urlsafe', {
                valuePropName: 'checked',
                initialValue: get(options, 'rules.urlsafe', false)
              })(
                <Switch />
              )}
              <label htmlFor="options.rules.urlsafe" style={{ marginLeft: 8 }}>URL Safe</label>
            </Form.Item>
            <Form.Item style={{ margin: 0 }}>
              {form.getFieldDecorator('options.rules.min', {
                valuePropName: 'checked',
                initialValue: get(options, 'rules.min', false)
              })(
                <Switch />
              )}
              <label htmlFor="options.rules.min" style={{ marginLeft: 8 }}>Min chars: </label>
              {form.getFieldDecorator('options.rules.minValue', {
                initialValue: get(options, 'rules.minValue')
              })(
                <Input size="small" type="number" style={{ marginLeft: 8, width: 64 }} />
              )}
            </Form.Item>
            <Form.Item style={{ margin: 0 }}>
              {form.getFieldDecorator('options.rules.max', {
                valuePropName: 'checked',
                initialValue: get(options, 'rules.max', false)
              })(
                <Switch />
              )}
              <label htmlFor="options.rules.max" style={{ marginLeft: 8 }}>Max chars: </label>
              {form.getFieldDecorator('options.rules.maxValue', {
                initialValue: get(options, 'rules.maxValue')
              })(
                <Input size="small" type="number" style={{ marginLeft: 8, width: 64 }} />
              )}
            </Form.Item>
          </>)}
      </>
    );
  }
}
