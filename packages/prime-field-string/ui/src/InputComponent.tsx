import { IPrimeFieldProps } from '@primecms/field';
import { Form, Input } from 'antd';
import BraftEditor from 'braft-editor'; // tslint:disable-line
import { debounce } from 'lodash'; // tslint:disable-line
import { draftToMarkdown, markdownToDraft } from 'markdown-draft-js'; // tslint:disable-line
import * as React from 'react';

const controls = [
  'headings', 'separator',
  'bold', 'italic', 'code', 'blockquote', 'separator',
  'list-ul', 'list-ol', 'separator',
  'link', 'emoji', 'separator',
  'undo', 'redo'
];

const markdownConfig = {
  preserveNewlines: true,
  remarkablePreset: 'full'
};

export class InputComponent extends React.PureComponent<IPrimeFieldProps> {

  public state = {
    value: BraftEditor.createEditorState(markdownToDraft(this.props.initialValue, markdownConfig))
  };

  public setMarkdownValue = debounce(
    () => {
      try {
        const { form, path } = this.props;
        form.setFieldsValue({
          [path]: draftToMarkdown(JSON.parse(this.state.value.toRAW()), markdownConfig).replace(/\n\n/g, '\n \n')
        });
      } catch (err) {
        console.error('Error converting rich text to markdown'); // tslint:disable-line no-console
      }
    },
    330
  );

  public onChange = (value: any) => { // tslint:disable-line no-any
    this.setState({ value }, this.setMarkdownValue);
  }

  public renderMarkdown = () => {
    const { form, field, path, initialValue = '' } = this.props;
    const { getFieldDecorator } = form;

    return (
      <Form.Item label={field.title}>
        <BraftEditor
          style={{ backgroundColor: 'white', borderRadius: 4, border: '1px solid #d9d9d9' }}
          controls={controls}
          value={this.state.value}
          onChange={this.onChange}
          language="en"
        />
        {getFieldDecorator(path, { initialValue })(
          <input type="hidden" />
        )}
      </Form.Item>
    );
  }

  public renderMultiline = () => {
    const { form, field, path, initialValue = '' } = this.props;
    const { getFieldDecorator } = form;

    return (
      <Form.Item label={field.title}>
        {getFieldDecorator(path, { initialValue })(
          <Input.TextArea
            autosize={{ minRows: 2, maxRows: 8 }}
          />
        )}
      </Form.Item>
    );
  }

  public render() {
    const { form, field, path, initialValue = '' } = this.props;
    const { getFieldDecorator } = form;

    if (field.options.markdown) {
      return this.renderMarkdown();
    }

    if (field.options.multiline) {
      return this.renderMultiline();
    }

    return (
      <Form.Item label={field.title}>
        {getFieldDecorator(path, { initialValue })(
          <Input size="large" />
        )}
      </Form.Item>
    );
  }
}
