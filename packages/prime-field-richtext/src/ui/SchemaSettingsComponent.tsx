import { PrimeFieldProps } from '@primecms/field';
import { Button, Form, Switch, Tooltip } from 'antd';
import { get } from 'lodash';
import React from 'react';

type IProps = PrimeFieldProps & {
  options: {};
};

const markdownFeatures = [
  {
    id: 'headings',
    icon: 'font-size',
    title: 'Headings',
  },
  {
    id: 'bold',
    title: 'Bold',
  },
  {
    id: 'italic',
    title: 'Italic',
  },
  {
    id: 'code',
    title: 'Code block',
  },
  {
    id: 'blockquote',
    icon: 'quote',
    title: 'Block quote',
  },
  {
    id: 'list-ul',
    icon: 'list',
    title: 'Bullet list',
  },
  {
    id: 'list-ol',
    icon: 'list-numbered',
    title: 'Ordered list',
  },
  {
    id: 'link',
    title: 'Hyperlink',
  },
  {
    id: 'emoji',
    title: 'Emoji',
  },
];

const defaultFeatures = [
  'headings',
  'bold',
  'italic',
  'code',
  'blockquote',
  'list-ul',
  'list-ol',
  'link',
  'emoji',
];

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
        'options.md': values,
      });
    }
  };

  // tslint:disable-next-line max-func-body-length
  public render() {
    const { form, options = {} } = this.props;
    const isMarkdown = true;
    const features: string[] = [].concat(form.getFieldValue('options.md') || defaultFeatures);

    return (
      <>
        {isMarkdown && (
          <Form.Item label="RichText features" style={{ marginBottom: 8 }} className="bf-container">
            {markdownFeatures.map((
              { id, icon, title }: any // tslint:disable-line
            ) => (
              <Tooltip title={title}>
                <Button
                  key={id}
                  data-id={id}
                  onClick={this.onClickMarkdownFeature}
                  type={features.indexOf(id) >= 0 ? 'primary' : undefined}
                  style={{
                    paddingTop: 2,
                    paddingLeft: 8,
                    paddingRight: 8,
                    marginRight: 8,
                    marginBottom: 8,
                  }}
                >
                  <i className={`bfi-${icon || id}`} />
                </Button>
              </Tooltip>
            ))}

            {form.getFieldDecorator('options.md', {
              initialValue: get(options, 'md', defaultFeatures),
            })(<input type="hidden" />)}
          </Form.Item>
        )}

        <Form.Item label="Options" style={{ marginBottom: -8 }} />
        <Form.Item style={{ margin: 0 }}>
          {form.getFieldDecorator('options.rules.required', {
            valuePropName: 'checked',
            initialValue: get(options, 'rules.required', false),
          })(<Switch />)}
          <label htmlFor="options.rules.required" style={{ marginLeft: 8 }}>
            Required
          </label>
        </Form.Item>
      </>
    );
  }
}
